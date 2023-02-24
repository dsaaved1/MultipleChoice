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

export const createChat = async (loggedInUserId, chatData) => {

    const newChatData = {
        ...chatData,
        //numberUsers: chatData.users.length,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const newChat = await push(child(dbRef, 'chats'), newChatData);

    const chatUsers = newChatData.users;
    for (let i = 0; i < chatUsers.length; i++) {
        const userId = chatUsers[i];
        await push(child(dbRef, `userChats/${userId}`), newChat.key);
        //await push(child(dbRef, `userGroups/${userId}`), newGroup.key);
    }
    console.log("should not log 5")

    return newChat.key;
}

export const createConvo = async (loggedInUserId, chatData, chatId) => {

   
    const app = getFirebaseApp();
    
    const dbRef = ref(getDatabase(app));
    
    const convosRef = child(dbRef, `convos/${chatId}`);
   
    
    const convoData = {
        convoName:  "Convo",
        chat: 'Chat',
        chatId: chatId,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
   
    const convoKey = await push(convosRef, convoData);
    
 
    return convoKey.key;
}

export const sendTextMessage = async (convoId, chatId, senderData, messageText, replyTo, chatUsers) => {
    await sendMessage(convoId, chatId, senderData.userId, messageText, null, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId, convoId);
}

export const sendAIMessage = async (convoId, chatId, senderData, messageText, replyTo, chatUsers) => {
    console.log("here before asking")
    await sendMessage(convoId, chatId, senderData.userId, messageText, null, replyTo, "myMessageAI");

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId, convoId);
}

export const sendInfoMessage = async (chatId, senderId, messageText) => {
    await sendMessage(chatId, senderId, messageText, null, null, "info");
}

export const sendImage = async (convoId, chatId, senderData, imageUrl, replyTo, chatUsers) => {
    await sendMessage(convoId, chatId, senderData.userId, 'Image', imageUrl, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, `${senderData.firstName} sent an image`, chatId, convoId);
}




export const updateChatNameData = async (chatId, userId, chatData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    await update(chatRef, {
        ...chatData,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
    })
}

export const updateChatDataSettings = async (chatId, userId, chatData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    await update(chatRef, {
        ...chatData,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
    })
}

// export const updateConvoColorMap = async (chatId, convoData, senderID, newColor) => {
//     const app = getFirebaseApp();
//     const dbRef = ref(getDatabase(app));
//     const convoRef = child(dbRef, `convos/${chatId}`);
//     console.log("inside Convo map")
//     const userMap = convoData.userMap || []; // if oldSenders is undefined, use an empty array
//     const newUserMap = [...userMap, senderID]; 
//     console.log(newUserMap)// create a new array that includes oldSenders and the new senderID
//     const colorMap = convoData.colorMap || []; 
//     const newColorMap = [...colorMap, newColor]; // create a new array that includes oldSenders and the new senderID
//     console.log(newColorMap)
//     await update(convoRef, {
//         ...convoData,
//         userMap: newUserMap,
//         colorMap: newColorMap,
//     })
// }


export const updateChatData = async (chatId, userId, chatData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    if (chatData.users){
        await update(chatRef, {
            ...chatData,
            numberUsers: chatData.users.length,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        })
    } else {
        await update(chatRef, {
            ...chatData,
            updatedAt: new Date().toISOString(),
            updatedBy: userId
        })
    }

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

    if (imageUrl) {
        messageData.imageUrl = imageUrl;
    }

    if (type) {
        messageData.type = type;
    }

    await push(messagesRef, messageData);

    
    const convoRef = child(dbRef, `convos/${chatId}/${convoId}`);
    await update(convoRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestMessageText: messageText
    });

    // Retrieve the data at convoRef
    const convoSnapshot = await get(convoRef);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestConvo: convoSnapshot.val().convoName,
        latestMessageText: messageText
    });
}

export const starMessage = async (messageId, convoId, userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const childRef = child(dbRef, `userStarredMessages/${userId}/${convoId}/${messageId}`);

        const snapshot = await get(childRef);

        if (snapshot.exists()) {
            // Starred item exists - Un-star
            await remove(childRef);
        }
        else {
            // Starred item does not exist - star
            const starredMessageData = {
                messageId,
                convoId,
                chatId,
                starredAt: new Date().toISOString()
            }

            await set(childRef, starredMessageData);
        }
    } catch (error) {
        console.log(error);        
    }
}

export const removeUserFromChat = async (userLoggedInData, userToRemoveData, chatData) => {
    const userToRemoveId = userToRemoveData.userId;
    const newUsers = chatData.users.filter(uid => uid !== userToRemoveId);
    await updateChatData(chatData.key, userLoggedInData.userId, { users: newUsers });

    const userChats = await getUserChats(userToRemoveId);

    for (const key in userChats) {
        const currentChatId = userChats[key];

        if (currentChatId === chatData.key) {
            await deleteUserChat(userToRemoveId, key);
            break;
        }
    }

    //we would this for contributors
    // const messageText = userLoggedInData.userId === userToRemoveData.userId ?
    //     `${userLoggedInData.firstName} left the chat` :
    //     `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

    // await sendInfoMessage(convoId, chatData.key, userLoggedInData.userId, messageText);
}

export const addUsersToChat = async (userLoggedInData, usersToAddData, chatData) => {
    const existingUsers = Object.values(chatData.users);
    const newUsers = [];

    let userAddedName = "";

    usersToAddData.forEach(async userToAdd => {
        const userToAddId = userToAdd.userId;

        if (existingUsers.includes(userToAddId)) return;

        newUsers.push(userToAddId);

        await addUserChat(userToAddId, chatData.key);

        userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
    });

    if (newUsers.length === 0) {
        return;
    }


    await updateChatData(chatData.key, userLoggedInData.userId, { users: existingUsers.concat(newUsers) })

    //we would this for contributors addUsersToConvo and send a message to convo
    // const moreUsersMessage = newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : '';
    // const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessage}to the chat`;
    // await sendInfoMessage(convoId, chatData.key, userLoggedInData.userId, messageText);

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