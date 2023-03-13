import {config} from "./config.js";
import fetch from "node-fetch";

let apiKey = config.openai_api_key;
let model = config.model;
//id: talkerId || talkerId + roomId

const context = new Map();

const sendMessage = async (message: string,sessionId:string) => {
  try {
    if(context.size>10000){
      context.clear();
    }

    let messages  = context.get(sessionId);
    if(!messages){
      messages = [];
      context.set(sessionId, messages);
    }
    messages.push({role:'user',content:message});
    while(messages.length > 3) {
      messages.shift();
    }
    // console.info('before ask',messages);
    console.info('ask///////',message);
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages,
        // temperature: 0.6
      }),
    });
    return response.json()
      .then((data) => 
      {
        // @ts-ignore
        let content = data.choices[0].message.content;
        messages.push({role:'assistant',content});
        console.info('answer------',content);
        return content;
      });
  } catch (e) {
    console.error(e)
    return "try again later!"
  }
}

export {sendMessage};