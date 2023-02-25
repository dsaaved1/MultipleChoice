import 'react-native-url-polyfill/auto';
import { child, get, getDatabase, push, ref, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import keys from '../../constants/keys';



export const sendQuestionDavinci = async (convoId, chatId, senderId, question) => {
    const { Configuration, OpenAIApi } = require('openai')
    const configuration = new Configuration({
      apiKey: keys.ai,
    })
    const openai = new OpenAIApi(configuration)

    console.log("here in ai before response")
    try {
        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: `Give me the answer to: ${question}?`,
          temperature: 1,
          max_tokens: 2060,
        });
    
        const answer = response.data.choices[0].text.trim();
        console.log("here in ai after response")

        
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const messagesRef = child(dbRef, `messages/${convoId}`);


        const messageData = {
            sentBy: senderId,
            question: question,
            model: 'Davinci',
            sentAt: new Date().toISOString(),
            text: answer,
            type: "AIMessage"
        };


        await push(messagesRef, messageData);
        
        const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
        await update(convoRef, {
            updatedBy: senderId,
            updatedAt: new Date().toISOString(),
            latestMessageText: answer
        });

    } catch (e) {
        console.error("Error asking AI: ", e);
    }


    
}


export const sendAIMessage = async (convoId, chatId, senderData, messageText) => {
    console.log("here before asking")
    await sendMessage(convoId, chatId, senderData.userId, messageText, "myMessageAI");

}


const sendMessage = async (convoId, chatId, senderId, messageText, type) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const messagesRef = child(dbRef, `messages/${convoId}`);

    const messageData = {
        sentBy: senderId,
        sentAt: new Date().toISOString(),
        text: messageText
    };


    if (type) {
        messageData.type = type;
    }

    await push(messagesRef, messageData);

    
    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
    });


    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
    });
}




