import 'react-native-url-polyfill/auto';
import { child, get, getDatabase, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import { getUserPushTokens } from "./authActions";
import { addUserChat, deleteUserChat, getUserChats } from "./userActions";
import keys from '../../constants/keys';
import { createIconSetFromFontello } from '@expo/vector-icons';



export const sendQuestionGPT3 = async (convoId, chatId, senderId, question) => {
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
            modelAI: 'GPT-3',
            modelAIPhoto: "https://firebasestorage.googleapis.com/v0/b/helloai2.appspot.com/o/profilePics%2Fopenai-avatar.png?alt=media&token=4c5ae596-3a7a-4f5d-a772-88e792f05b73",
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


export const sendAIMessage = async (convoId, chatId, senderData, messageText, replyTo, chatUsers) => {
    console.log("here before asking")
    await sendMessage(convoId, chatId, senderData.userId, messageText, null, replyTo, "myMessageAI");

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId, convoId);
}


export const sendImage = async (convoId, chatId, senderData, imageUrl, replyTo, chatUsers) => {
    await sendMessage(convoId, chatId, senderData.userId, 'Image', imageUrl, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, `${senderData.firstName} sent an image`, chatId, convoId);
}



export const updateConvoData = async (convoId, chatId, newConvoName) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        convoName: newConvoName,
        updatedAt: new Date().toISOString(),
    });
}

const sendMessage = async (convoId, chatId, senderId, messageText, imageUrl, replyTo, type) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const messagesRef = child(dbRef, `messages/${convoId}`);

    const messageData = {
        sentBy: senderId,
        sentAt: new Date().toISOString(),
        text: messageText
    };

    if (replyTo) {
        messageData.replyTo = replyTo;
    }


    if (type) {
        messageData.type = type;
    }

    await push(messagesRef, messageData);

    
    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
    });

    // Retrieve the data at convoRef
    const convoSnapshot = await get(convoRef);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
    });
}




const sendPushNotificationForUsers = (chatUsers, title, body, chatId, convoId) => {
    chatUsers.forEach(async uid => {
        console.log("test");
        const tokens = await getUserPushTokens(uid);

        for(const key in tokens) {
            const token = tokens[key];

            await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    body,
                    data: { chatId, convoId }
                })
            })
        }
    })
}