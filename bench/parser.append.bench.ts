import { StreamingParser } from "../src/StreamingParser";

const appendCharByChar = (parser: StreamingParser, text: string): void => {
  for (let i = 0; i < text.length; i += 1) {
    parser.append(text[i] ?? "");
  }
};

type Scenario = {
  name: string;
  run: () => void;
};

const scenarios: Scenario[] = [
  {
    name: "append char-by-char 10k plain text",
    run: () => {
      const parser = new StreamingParser("");
      appendCharByChar(parser, "a".repeat(10_000));
    },
  },
  {
    name: "append line-by-line mixed markdown 2k lines",
    run: () => {
      const parser = new StreamingParser("");
      for (let i = 0; i < 2_000; i += 1) {
        parser.append(
          `- [${i % 2 ? "x" : " "}] item ${i} with [link](x) and \`code\`\n`,
        );
      }
    },
  },
  {
    name: "append large fenced block 5k lines",
    run: () => {
      const parser = new StreamingParser("");
      parser.append("```ts\n");
      for (let i = 0; i < 5_000; i += 1) {
        parser.append(`const v${i} = ${i};\n`);
      }
      parser.append("```");
    },
  },
  {
    name: "append large table 2k rows",
    run: () => {
      const parser = new StreamingParser("");
      parser.append("| h1 | h2 |\n| --- | --- |\n");
      for (let i = 0; i < 2_000; i += 1) {
        parser.append(`| a${i} | b${i} |\n`);
      }
    },
  },
  {
    name: "append deeply nested blockquote/list",
    run: () => {
      const parser = new StreamingParser("");
      let input = "";
      for (let i = 0; i < 120; i += 1) {
        input += `${"> ".repeat(i)}- level ${i}\n`;
      }
      parser.append(input);
    },
  },
];

const runScenario = (scenario: Scenario): number => {
  const started = performance.now();
  scenario.run();
  return performance.now() - started;
};

for (const scenario of scenarios) {
  const elapsed = runScenario(scenario);
  console.log(`${scenario.name}: ${elapsed.toFixed(2)}ms`);
}
