import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
import readlineSync from "readline-sync";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Tools
function getWeatherDetails(city) {
  if (city.toLowerCase() === "bangalore") return "28 °C";
  if (city.toLowerCase() === "lucknow") return "34 °C";
  if (city.toLowerCase() === "kirandul") return "28 °C";
  if (city.toLowerCase() === "delhi") return "30 °C";
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};

const SYSTEM_PROMPT = `You are an AI assistant with PLAN, ACTION, OBSERVATION and OUTPUT states. Wait for user prompt and first PLAN using available tools. After planning, take the ACTION using appropiate tools, and wait for observation based on action. Once you get the OBSERVATIONS, return the AI OUTPUT based on START prompt and OBSERVATIONS.

strictly follow the JSON output format as in examples.

Available tools: 
- function: getWeatherDetails
description: Get the weather details of a city

Example: 
START: 
{"type":"user","user":"What is sum of weather of Delhi and Lucknow?"},
{"type":"plan","plan":"I will call the getWeatherDetails for Delhi"},
{"type":"action","function":"getWeatherDetails", input:"Delhi"},
{"type":"observation","observation":"30 °C"},
{"type":"plan","plan":"I will call the getWeatherDetails for Lucknow"},
{"type":"action","function":"getWeatherDetails", input:"Lucknow"},
{"type":"observation","observation":"34 °C"},
{"type":"output","output":"The sum of weather of Delhi and Lucknow is 64 °C"},
END:
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];
while (true) {
  const query = readlineSync.question(">> ");
  const q = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: {
        type: "json_object",
      },
    });
    const result = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: result });

    console.log(`\n\n------- START AI --------`);
    console.log(result);
    console.log(`------- END AI --------\n\n`);

    const call = JSON.parse(result);

    if (call.type === "output") {
      console.log(`🤖: ${call.output}`);
      break;
    } else if (call.type === "action") {
      const fn = tools[call.function];
      const observation = fn(call.input);
      const obs = {
        type: "observation",
        observation: observation,
      };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
