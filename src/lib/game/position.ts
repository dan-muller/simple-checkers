/**
 * =============================================================================
 * This defines the letters and numerals used to represent the board positions.
 * This is isolated from the rest of the game logic in order to make it easier to
 * change the orientation or size of the board if needed.
 * =============================================================================
 */
const [letters, numerals] = [
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  ['1', '2', '3', '4', '5', '6', '7', '8'],
] as const;

/**
 * =============================================================================
 * This defines the rows and columns of the board as the union of the respective
 * arrays. It also defines the type for a row and column, as well as the type for
 * a position on the board.
 * =============================================================================
 */

// Define Rows and Columns as the union of the respective arrays
export const [cols, rows] = [
  // Columns are the letters
  letters,
  // Rows are the numerals in reverse order
  numerals.toReversed(),
] as const;

// Defines the type for a row
export type Row = (typeof rows)[number];

// Defines the type for a column
export type Column = (typeof cols)[number];

// Template literal type for a position on the board (e.g. 'a1', 'h8')
export type Position = `${Column}${Row}`;

// All possible positions on the board
export const positions: Position[] = rows.flatMap((row) => cols.map((col) => `${col}${row}` as Position));

/**
 * =============================================================================
 * This defines the functions to validate the rows and columns, as well as to
 * convert between positions and row/column indices.
 * =============================================================================
 */

// Check if a row index is valid
export const isValidRowIndex = (row: unknown): row is number =>
  typeof row === 'number' && row >= 0 && row < rows.length;

// Check if a column index is valid
export const isValidColIndex = (col: unknown): col is number =>
  typeof col === 'number' && col >= 0 && col < cols.length;

// Check if a row is valid
export const isValidRow = (row: unknown): row is Row => typeof row === 'string' && rows.includes(row as never);

// Check if a column is valid
export const isValidCol = (col: unknown): col is Column => typeof col === 'string' && cols.includes(col as never);

// Convert a column and row or column index and row index to a position
export const toPosition = (
  ...[col, row]: [col: number, row: number] | [col: Column, row: Row] | [{ col: Column; row: Row }]
): Position | undefined => {
  if (typeof col === 'object' && 'col' in col && 'row' in col) {
    return toPosition(col.col, col.row);
  } else if (isValidColIndex(col) && isValidRowIndex(row)) {
    return `${cols[col]}${rows[row]}` as Position;
  } else if (isValidCol(col) && isValidRow(row)) {
    return `${col}${row}` as Position;
  }
  return undefined;
};

// Convert a position to a column and row
export const fromPosition = (position: Position) => {
  const split = [position[0] as Column, position[1] as Row] as const;
  return Object.assign(split, {
    // Convert the position to a column index and row index
    toIndex: () => [cols.indexOf(split[0]), rows.indexOf(split[1])] as const,
  });
};
