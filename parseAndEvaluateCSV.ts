import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import * as math from 'mathjs';

const inputFile = 'input.csv';
const outputFile = 'output.csv';

interface Variables {
  [key: string]: number;
}

// Function to asynchronously read and parse the CSV file
const readCSV = async (filePath: string): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const data: string[][] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: false, trim: true }))
      .on('data', (row: string[]) => data.push(row))
      .on('error', (error: any) => reject(error))
      .on('end', () => resolve(data));
  });
};

// Function to evaluate expressions and generate output CSV
const evaluateAndGenerateCSV = async (data: string[][]): Promise<string> => {
  const variables: Variables = data[0].reduce((acc: Variables, value, index) => {
    const letter = String.fromCharCode(65 + index); // Converts 0 => A, 1 => B, etc.
    acc[letter] = parseFloat(value);
    return acc;
  }, {} as Variables); // Explicitly cast the initial value as Variables

  const results = data.map((row, rowIndex) => {
    if (rowIndex === 0) return row; // Skip the header row

    return row.map(cell => {
      try {
        const evaluated = math.evaluate(cell, variables);
        return isNaN(evaluated as number) ? cell : evaluated.toString();
      } catch (error) {
        const message = (error as Error).message; // Type assertion to Error
        console.error(`Error evaluating expression "${cell}":`, message);
        return cell;
      }
    });
  });

  return new Promise((resolve, reject) => {
    stringify(results, { header: false }, (error: any, output: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    });
  });
};


// Main function to orchestrate reading, evaluating, and writing CSV
const main = async (): Promise<void> => {
  try {
    const data = await readCSV(inputFile);
    const output = await evaluateAndGenerateCSV(data);
    fs.writeFileSync(outputFile, output);
    console.log(`Evaluation complete. Check ${outputFile}`);
  } catch (error) {
    const message = (error as Error).message; // Type assertion to Error
    console.error('An error occurred:', message);
  }
};

main();