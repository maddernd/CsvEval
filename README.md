# CSV Evaluation Tool

This Node.js application reads an input CSV file containing algebraic expressions, evaluates these expressions, and writes the results to an output CSV file.

## Prerequisites

Before running this application, ensure you have the following installed:
- Node.js (v18 or later)
- npm 

## Setup

Follow these steps to set up the project on your local machine:

1. **Clone the Repository** 

   git clone <https://github.com/maddernd/CsvEval.git>
   cd <CSEval>

2. **Install dependencies**

    npm install

3. **Compile Typescript to JavaScript**

    npx tsc

4. **Run the application**

    node parseAndEvaluateCSV.js


## Input File Format
The input CSV file should be named input.csv and placed in the root of the project directory. The first row should contain single integers for each column, which represent the variables (A through K). 
The subsequent rows should contain algebraic expressions that refer to these variables.

## Output
After successfully running the application, check the output.csv file in the root of the project directory for the results.