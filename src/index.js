import * as Blockly from "blockly";
import * as BlocklyMsgUk from "blockly/msg/uk";
import * as BlocklyMsgEn from "blockly/msg/en";
import { blockJsonArray } from "./blocks/computcraft";
import { forBlock } from "./generators/lua";
import { luaGenerator } from "blockly/lua";
import { save, load } from "./serialization";
import { buildToolbox } from "./toolbox";
import { uk } from "./i18n/uk";
import { en } from "./i18n/en";
import Prism from "prismjs";
import "./prismjs/prism-lua.js";
import "./prismjs/prism-dark.css";
import "./index.css";
import "./toolbox_style.css";

import {shadowBlockConversionChangeListener} from '@blockly/shadow-block-converter';

Prism.highlightAll();

// const secret = require('./secret.json');  // removed: pastebin integration unused

// Variables
const version = "1.1.6";
const date = new Date().toUTCString();


// Language setup
const LANGS = { uk, en };
const BLOCKLY_MSGS = { uk: BlocklyMsgUk, en: BlocklyMsgEn };
const lang = localStorage.getItem('cctweak_lang') || 'uk';
const dict = LANGS[lang] || uk;
Blockly.setLocale(BLOCKLY_MSGS[lang].default || BLOCKLY_MSGS[lang]);

// Apply UI translations
document.querySelectorAll('[data-i18n]').forEach((el) => {
  const path = el.getAttribute('data-i18n').split('.');
  let val = dict;
  for (const k of path) val = val?.[k];
  if (typeof val === 'string') el.textContent = val;
});

// Translate custom turtle/cc blocks by mutating raw JSON before compilation
const D = dict.blockly;
const dirUp = [
  [D.TURTLE_DIR_FORWARD, ""],
  [D.TURTLE_DIR_UP, "Up"],
  [D.TURTLE_DIR_DOWN, "Down"],
];
const moveDirs = [
  [D.TURTLE_MOVE_FORWARD, "forward"],
  [D.TURTLE_MOVE_UP, "up"],
  [D.TURTLE_MOVE_DOWN, "down"],
  [D.TURTLE_MOVE_BACK, "back"],
  [D.TURTLE_MOVE_LEFT, "turnLeft"],
  [D.TURTLE_MOVE_RIGHT, "turnRight"],
];
const patch = (type, message0, dirOpts) => {
  const b = blockJsonArray.find((x) => x.type === type);
  if (!b) return;
  if (message0) b.message0 = message0;
  if (dirOpts && b.args0) {
    const dd = b.args0.find((a) => a.type === "field_dropdown" && a.name === "DIR");
    if (dd) dd.options = dirOpts;
  }
};
patch("turtle_move", D.TURTLE_MOVE, moveDirs);
patch("turtle_dig", D.TURTLE_DIG, dirUp);
patch("turtle_build", D.TURTLE_BUILD, dirUp);
patch("turtle_detect", D.TURTLE_DETECT, dirUp);
patch("turtle_drop", D.TURTLE_DROP, dirUp);
patch("turtle_select", D.TURTLE_SELECT);
patch("turtle_getitemcount", D.TURTLE_GETITEMCOUNT);
patch("turtle_blockname", D.TURTLE_BLOCKNAME, dirUp);
patch("turtle_select_next_nonempty", D.TURTLE_SELECT_NEXT_NONEMPTY);
patch("print", D.CC_PRINT);
patch("write", D.CC_WRITE);
patch("read", D.CC_READ);
patch("sleep", D.CC_SLEEP);

const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(blockJsonArray);
Blockly.common.defineBlocks(blocks);
Object.assign(luaGenerator.forBlock, forBlock);

const codeDiv = document.getElementById("generatedCode").firstChild;
const blocklyDiv = document.getElementById("blocklyDiv");
const ws = Blockly.inject(blocklyDiv, { toolbox: buildToolbox(dict) });

ws.addChangeListener(shadowBlockConversionChangeListener);

function htmlDecode(input){
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

const runCode = () => {
  const code = luaGenerator.workspaceToCode(ws).replace(/<br>/g, '\n');
  codeDiv.textContent = htmlDecode(code);
  Prism.highlightElement(codeDiv);
};

runCode();

ws.addChangeListener((e) => {
  if (e.isUiEvent) return;
  save(ws);
});

ws.addChangeListener((e) => {
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || ws.isDragging()) {
    return;
  }
  runCode();
});


// Theme

const theme = Blockly.Theme.defineTheme('computcraft', {
  'base': Blockly.Themes.Classic,
  'categoryStyles': {
    'table_category': {
      'colour': '#943794',
    },
    'redstone_category': {
      'colour': '#B01113',
    },
    'rednet_category': {
      'colour': '#C15100',
    },
    'turtle_category': {
      'colour': '#00B400',
    },
    'peripheral_category': {
      'colour': '#BCA400',
    },
    'disk_category': {
      'colour': '#276359',
    },
    'filesystem_category': {
      'colour': '#005C9A',
    },
    'base_category': {
      'colour': '#CFCA77',
    },
    'http_category': {
      'colour': '#008B8B',
    },
    'monitor_category': {
      'colour': '#D4A017',
    },
    'printer_category': {
      'colour': '#9E23FF',
    },
  },

  'blockStyles': {
    'table_category': {
      'colourPrimary': '#943794',
      'colourSecondary': '#7B2CBF',
      'colourTertiary': '#5C007A',
    },
    'computcraft_block': {
      'colourPrimary': '#4C97FF',
      'colourSecondary': '#3373CC',
      'colourTertiary': '#2E5BAE',
    },
  },
});


ws.setTheme(theme);


const copyButton = document.getElementById('copyButton');
const fileName = document.getElementById('fileName');
const downloadButton = document.getElementById('downloadButton');
const loadButton = document.getElementById('loadButton');

const copyCode = () => {
  const code = luaGenerator.workspaceToCode(ws);
  navigator.clipboard.writeText(code);
};

const downloadWorkspace = () => {
  const json = {
    "name": fileName.value || "workspace",
    "version": version,
    "date": date,
    "workspace": save(ws),
    "lua": luaGenerator.workspaceToCode(ws)
  }
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (fileName.value || 'workspace.json') + '.ccbe';
  a.click();
};

const downloadLua = () => {
  const code = luaGenerator.workspaceToCode(ws);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (fileName.value || 'workspace') + '.lua';
  a.click();
};

const loadWorkspace = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.ccbe';
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const json = JSON.parse(reader.result);
      load(ws, json['workspace']);
      fileName.value = json['name'];
      codeDiv.innerText = json['lua'];
    };
    reader.readAsText(file);
  };
};

//const uploadToPastebin = () => {
//  const code = luaGenerator.workspaceToCode(ws);
//  const xhr = new XMLHttpRequest();
//  xhr.open('POST', 'https://pastebin.com/api/api_post.php', true);
//  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//  xhr.onreadystatechange = () => {
//    if (xhr.readyState == 4 && xhr.status == 200) {
//      const url = xhr.responseText;
//      const a = document.createElement('a');
//      a.href = url;
//      a.target = '_blank';
//      a.click();
//    }
//  };
//  if (secret['connected'] === false) {
//    xhr.send(`api_dev_key=${secret['api_dev_key']}&api_user_key=${secret['api_user_key']}&api_folder_key=5BbL8uf5&api_option=paste&api_paste_code=${encodeURIComponent(code)}&api_paste_private=1&api_paste_name=${(fileName.value || 'workspace') + ' | lua (' + Math.random().toString(36).substring(7) + ')'}&api_paste_format=lua`);
//  } else {
//    xhr.send(`api_dev_key=${secret['api_dev_key']}&api_option=paste&api_paste_code=${encodeURIComponent(code)}&api_paste_private=1&api_paste_name=${(fileName.value || 'workspace') + ' | lua (' + Math.random().toString(36).substring(7) + ')'}&api_paste_format=lua`);
//  }
//}

//const uploadWorkspaceToPastebin = () => {
//  const workspace = save(ws);
//  const xhr = new XMLHttpRequest();
//  xhr.open('POST', 'https://pastebin.com/api/api_post.php', true);
//  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//  xhr.onreadystatechange = () => {
//    if (xhr.readyState == 4 && xhr.status == 200) {
//      const url = xhr.responseText;
//      const a = document.createElement('a');
//      a.href = url;
//      a.target = '_blank';
//      a.click();
//    }
//  };
//  if (secret['connected'] === false) {
//    xhr.send(`api_dev_key=${secret['api_dev_key']}&api_user_key=${secret['api_user_key']}&api_folder_key=5BbL8uf5&api_option=paste&api_paste_code=${encodeURIComponent(workspace)}&api_paste_private=1&api_paste_name=${(fileName.value || 'workspace') + ' | workspace (' + Math.random().toString(36).substring(7) + ')'}&api_paste_format=json`);
//  } else {
//    xhr.send(`api_dev_key=${secret['api_dev_key']}&api_option=paste&api_paste_code=${encodeURIComponent(workspace)}&api_paste_private=1&api_paste_name=${(fileName.value || 'workspace') + ' | workspace (' + Math.random().toString(36).substring(7) + ')'}&api_paste_format=json`);
//  }
//}

//const loadWorkspaceFromPastebin = () => {
//  const id = prompt('Enter pastebin ID');
//  if (!id) return;
//  const xhr = new XMLHttpRequest();
//  xhr.open('GET', `pastebin.php?id=${id}`, true);
//  xhr.onreadystatechange = () => {
//    if (xhr.readyState == 4 && xhr.status == 200) {
//      load(ws, xhr.responseText);
//      console.log(xhr.responseText);
//    }
//  };
//  xhr.send();
//}

//const connectToPastebin = () => {
//  const username = prompt('Enter pastebin username');
//  const password = prompt('Enter pastebin password');
//  const xhr = new XMLHttpRequest();
//  xhr.open('POST', 'https://pastebin.com/api/api_login.php', true);
//  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//  xhr.onreadystatechange = () => {
//    if (xhr.readyState == 4 && xhr.status == 200) {
//      const response = xhr.responseText;
//      if (response.startsWith('Bad API request')) {
//        alert('Invalid username or password');
//      } else {
//        secret['api_user_key'] = response;
//        alert('Connected to pastebin');
//        connectButton.disabled = true;
//        connectButton.innerText = 'Connected';
//      }
//    }
//  };
//  xhr.send(`api_dev_key=${secret['api_dev_key']}&api_user_name=${username}&api_user_password=${password}`);
//}


const BLOCKLY_MARKER = '-- BLOCKLY_STATE:';

const utf8ToBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const base64ToUtf8 = (str) => decodeURIComponent(escape(atob(str)));

const embedBlocklyState = (code) => {
  const state = save(ws);
  return `${BLOCKLY_MARKER}${utf8ToBase64(state)}\n${code}`;
};

const extractBlocklyState = (text) => {
  const firstNewline = text.indexOf('\n');
  const firstLine = firstNewline === -1 ? text : text.slice(0, firstNewline);
  if (!firstLine.startsWith(BLOCKLY_MARKER)) {
    return { state: null, code: text };
  }
  try {
    const b64 = firstLine.slice(BLOCKLY_MARKER.length).trim();
    const state = base64ToUtf8(b64);
    const code = firstNewline === -1 ? '' : text.slice(firstNewline + 1);
    return { state, code };
  } catch {
    return { state: null, code: text };
  }
};

const getServerPayload = () => ({ serverId: document.getElementById('serverId').value });

const uploadToMinecraft = async () => {
  const statusEl = document.getElementById('uploadStatus');
  const comp = document.getElementById('computerId').value;
  const name = (fileName.value || 'program').replace(/[^a-zA-Z0-9_\-]/g, '') + '.lua';
  const code = luaGenerator.workspaceToCode(ws);

  if (!code.trim()) { statusEl.textContent = dict.ui.emptyCode; return; }

  const payloadCode = embedBlocklyState(code);
  statusEl.textContent = dict.ui.uploading;
  try {
    const r = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: payloadCode, comp, fileName: name, ...getServerPayload() }),
    });
    statusEl.textContent = await r.text();
    if (r.ok) refreshFileList();
  } catch (err) {
    statusEl.textContent = '❌ ' + err.message;
  }
};

document.getElementById('uploadMcButton').onclick = uploadToMinecraft;

// ==================== FILE LIST ====================
const fileListEl = document.getElementById('fileList');
const fileListStatus = document.getElementById('fileListStatus');
let currentServerFile = null;

const setListMessage = (text, cls = 'file-list-empty') => {
  fileListEl.innerHTML = '';
  const li = document.createElement('li');
  li.className = cls;
  li.textContent = text;
  fileListEl.appendChild(li);
};

async function refreshFileList() {
  const comp = document.getElementById('computerId').value.trim();
  if (!comp) { setListMessage(dict.ui.noData); return; }
  setListMessage(dict.ui.loading);
  fileListStatus.textContent = '';
  try {
    const r = await fetch('/api/list_files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comp, ...getServerPayload() }),
    });
    const data = await r.json();
    if (data.error) { setListMessage('❌ ' + data.error); return; }
    if (!data.files || !data.files.length) { setListMessage(dict.ui.empty); return; }
    renderFiles(data.files, comp);
  } catch (err) {
    setListMessage('❌ ' + err.message);
  }
}

function renderFiles(files, comp) {
  fileListEl.innerHTML = '';
  files.forEach((f) => {
    const li = document.createElement('li');
    if (f === currentServerFile) li.classList.add('active');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-name';
    nameSpan.textContent = f;
    nameSpan.onclick = () => loadFileFromServer(comp, f);
    const delBtn = document.createElement('button');
    delBtn.className = 'file-delete-btn';
    delBtn.textContent = '\u00d7';
    delBtn.title = dict.ui.confirmDelete;
    delBtn.onclick = (e) => { e.stopPropagation(); deleteFileFromServer(comp, f); };
    li.appendChild(nameSpan);
    li.appendChild(delBtn);
    fileListEl.appendChild(li);
  });
}

async function loadFileFromServer(comp, file) {
  fileListStatus.textContent = dict.ui.loading;
  try {
    const r = await fetch('/api/list_files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comp, file, ...getServerPayload() }),
    });
    const data = await r.json();
    if (data.error) { fileListStatus.textContent = '❌ ' + data.error; return; }
    const { state, code } = extractBlocklyState(data.content);
    const baseName = data.name.replace(/\.lua$/, '');
    fileName.value = baseName;
    currentServerFile = data.name;
    if (state) {
      ws.clear();
      load(ws, state);
      fileListStatus.textContent = dict.ui.loadedFromServer;
    } else {
      codeDiv.textContent = code;
      Prism.highlightElement(codeDiv);
      fileListStatus.textContent = dict.ui.noBlockState;
    }
    refreshFileList();
  } catch (err) {
    fileListStatus.textContent = '❌ ' + err.message;
  }
}

async function deleteFileFromServer(comp, file) {
  if (!confirm(`${dict.ui.confirmDelete}: "${file}"?`)) return;
  try {
    const r = await fetch('/api/list_files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comp, file, action: 'delete', ...getServerPayload() }),
    });
    const data = await r.json();
    if (data.error) { fileListStatus.textContent = '❌ ' + data.error; return; }
    if (currentServerFile === file) currentServerFile = null;
    refreshFileList();
  } catch (err) {
    fileListStatus.textContent = '❌ ' + err.message;
  }
}

document.getElementById('refreshFilesBtn').onclick = refreshFileList;

// Language switcher
const langSelect = document.getElementById('langSelect');
langSelect.value = lang;
langSelect.onchange = () => {
  localStorage.setItem('cctweak_lang', langSelect.value);
  location.reload();
};


// Persist server/computer selection
const serverSel = document.getElementById('serverId');
const compInput = document.getElementById('computerId');
serverSel.value = localStorage.getItem('cctweak_server') || 'server2';
compInput.value = localStorage.getItem('cctweak_comp') || '0';
serverSel.onchange = () => localStorage.setItem('cctweak_server', serverSel.value);
compInput.onchange = () => localStorage.setItem('cctweak_comp', compInput.value);

copyButton.onclick = copyCode;
downloadButton.onclick = downloadWorkspace;
downloadLuaButton.onclick = downloadLua;
loadButton.onclick = loadWorkspace;
//connectButton.onclick = connectToPastebin;
//uploadButton.onclick = uploadToPastebin;
//uploadWorkspaceButton.onclick = uploadWorkspaceToPastebin;
//loadWorkspaceButton.onclick = loadWorkspaceFromPastebin;