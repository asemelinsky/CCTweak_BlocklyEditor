/**
 * Simplified toolbox for beginner students — 8 categories.
 * Full toolbox preserved in toolbox.full.js.bak for advanced mode later.
 */

const shadowNum = (n) => ({ shadow: { type: "math_number", fields: { NUM: n } } });
const shadowText = (t) => ({ shadow: { type: "text", fields: { TEXT: t } } });

export const buildToolbox = (dict) => ({
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: dict.categories.movement,
      categorystyle: "turtle_category",
      contents: [
        { kind: "block", type: "turtle_move", inputs: { TIMES: shadowNum(1) } },
      ],
    },
    {
      kind: "category",
      name: dict.categories.build,
      categorystyle: "turtle_category",
      contents: [
        { kind: "block", type: "turtle_build" },
        { kind: "block", type: "turtle_dig" },
        { kind: "block", type: "turtle_select", inputs: { NUM: shadowNum(1) } },
        { kind: "block", type: "turtle_select_next_nonempty" },
        { kind: "block", type: "turtle_detect" },
        { kind: "block", type: "turtle_getitemcount", inputs: { SLOT: shadowNum(0) } },
        { kind: "block", type: "turtle_blockname" },
        { kind: "block", type: "turtle_drop" },
      ],
    },
    {
      kind: "category",
      name: dict.categories.loops,
      categorystyle: "loop_category",
      contents: [
        { kind: "block", type: "controls_repeat_ext", inputs: { TIMES: shadowNum(10) } },
        { kind: "block", type: "controls_whileUntil" },
        {
          kind: "block",
          type: "controls_for",
          inputs: { FROM: shadowNum(1), TO: shadowNum(10), BY: shadowNum(1) },
        },
      ],
    },
    {
      kind: "category",
      name: dict.categories.logic,
      categorystyle: "logic_category",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
      ],
    },
    {
      kind: "category",
      name: dict.categories.math,
      categorystyle: "math_category",
      contents: [
        { kind: "block", type: "math_number", fields: { NUM: 0 } },
        {
          kind: "block",
          type: "math_arithmetic",
          inputs: { A: shadowNum(1), B: shadowNum(1) },
        },
        {
          kind: "block",
          type: "math_random_int",
          inputs: { FROM: shadowNum(1), TO: shadowNum(100) },
        },
      ],
    },
    {
      kind: "category",
      name: dict.categories.text,
      categorystyle: "text_category",
      contents: [
        { kind: "block", type: "text" },
        { kind: "block", type: "print", inputs: { TEXT: shadowText("Привіт!") } },
        { kind: "block", type: "write", inputs: { TEXT: shadowText("abc") } },
        { kind: "block", type: "read" },
        { kind: "block", type: "sleep", inputs: { SEC: shadowNum(1) } },
      ],
    },
    {
      kind: "category",
      name: dict.categories.variables,
      categorystyle: "variable_category",
      custom: "VARIABLE",
    },
    {
      kind: "category",
      name: dict.categories.functions,
      categorystyle: "procedure_category",
      custom: "PROCEDURE",
    },
  ],
});
