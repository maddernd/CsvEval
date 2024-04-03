// Imports used are csv parse for reading csv data, csv stringfy for converting back to csv format and Mathjs for evaluating expressions.
import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import * as math from 'mathjs';

// Set input and output file conts
const inputFile = 'input.csv';
const outputFile = 'output.csv';

// Interface to describe the shape of the variables object used for expression evaluation
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
      // Resolve promise with accumlated data
      .on('end', () => resolve(data));
  });
};

// Function to evaluate expressions and generate output CSV
const evaluateAndGenerateCSV = async (data: string[][]): Promise<string> => {
  // Creating a variables object from the first row
  const variables: Variables = data[0].reduce((acc: Variables, value, index) => {
    // Converts 0 => A, 1 => B as per task requirements.
    const letter = String.fromCharCode(65 + index); 
    // Assigning numeric value to letter key in accumulator object
    acc[letter] = parseFloat(value);
    // Returning the accumulator for the next iteration
    return acc;
    // Explicitly cast the initial value as Variables
  }, {} as Variables); 

  // Mapping over each row of the input data
  const results = data.map((row, rowIndex) => {
    // Skip the header row
    if (rowIndex === 0) return row; 

    return row.map(cell => {
      try {
        // Evaluating the expression in the cell using the variables object
        const evaluated = math.evaluate(cell, variables);
        return isNaN(evaluated as number) ? cell : evaluated.toString();
      } catch (error) {
        const message = (error as Error).message; 
        console.error(`Error evaluating expression "${cell}":`, message);
        // Returning the original cell value in case of error
        return cell;
      }
    });
  });

  return new Promise((resolve, reject) => {
    stringify(results, { header: false }, (error: any, output: string) => {
      if (error) {
         // Rejecting promise if error occurs during stringification
        reject(error);
      } else {
        // Resolving promise with CSV string output
        resolve(output);
      }
    });
  });
};


// Main function to run reading, evaluating, and writing CSV
const main = async (): Promise<void> => {
  try {
    // Reading and parsing the input CSV
    const data = await readCSV(inputFile);
    // Evaluating expressions and generating output CSV data
    const output = await evaluateAndGenerateCSV(data);
    // Writing the output data to a file
    fs.writeFileSync(outputFile, output);
    console.log(`Evaluation complete. Check ${outputFile}`);
  } catch (error) {
    const message = (error as Error).message; 
    console.error('An error occurred:', message);
  }
};

main();