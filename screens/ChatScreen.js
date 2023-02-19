import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import backgroundImage from "../assets/images/droplet.jpeg";
import colors from "../constants/colors";
import openAIAvatar from '../assets/images/openai-avatar.png';

import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import MainMessage from "../components/MainMessage";
import ReplyTo from "../components/ReplyTo";

import { useSelector } from "react-redux";
import { createChat, createConvo, sendImage, sendTextMessage, sendAIMessage, sendQuestionGPT3 } from "../utils/actions/chatActions";
import { launchImagePicker, openCamera, uploadImageAsync } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [activeAI, setActiveAI] = useState(false);
  const [nameAI, setNameAI] = useState('GPT-3');
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [convoId, setConvoId] = useState(props.route?.params?.convoId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //we use this to create a reference to component
  // and scrolling the chat to the bottom new message
  const flatList = useRef();

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const storedChats = useSelector(state => state.chats.chatsData);
  //chatData is null when we don't a chatID because we haven't started a conversation yet
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  

  // const convoData = (chatId && convoId && useSelector(state => state.convos.convosData[chatId][convoId])) || props.route?.params?.newChatData || {};
  // console.log(convoId, " convoId")

  const chatMessages = useSelector(state => {
    if (!convoId) return [];

    const chatMessagesData = state.messages.messagesData[convoId];

    if (!chatMessagesData) return [];

    const messageList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({
        key,
        ...message
      });
    }

    return messageList;
  });
  


  const getChatTitleFromName = () => {
    
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }


  useEffect(() => {
    if (!chatData) return;
   
    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(), //convoData.convoName ?? getChatTitleFromName() chatData.chatName ?? getChatTitleFromName(),
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: '#0E1528', // set the background color
        elevation: 5, // set the elevation to add shadow
        shadowOpacity: 0.5,
        marginBottom: 10, // add margin to the bottom of the header
        borderBottomColor: 'grey', // add a bottom border to the header
        borderBottomWidth: 0.5, // set the width of the bottom border
      },
      headerTitleStyle: {
        color: 'white', // set the header title color
        fontSize: 20, // set the font size
        fontWeight: 'medium', // set the font weight
      },
    
      // headerRight: () => {
      //   return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
      //     {
      //       //we will put this again after adding contributors functionality
      //       chatId && 
      //       <Item
      //         title="Chat settings"
      //         iconName="settings-outline"
      //         onPress={() => chatData.isGroupChat ?
      //           // we will send convoId to chatSetting to display the message when we deal with contributors
      //           props.navigation.navigate("ChatSettings", { chatId, convoId }) :
      //           props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
      //       />
      //     }
      //   </HeaderButtons>
      // }
    })
    setChatUsers(chatData.users)
  }, [chatUsers])



  const sendMessage = useCallback(async () => {

    try {
      
      let id = chatId;
      let id2 = convoId;
      if (!id) {
        console.log("about to create a chat")
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
        id2 = await createConvo(userData.userId, props.route.params.newChatData, id);
        setConvoId(id2);
      }

      if (activeAI){
          console.log("about to send ai questions")
          await sendAIMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
          await sendQuestionGPT3(id2, id, userData.userId, messageText)
      } else {
        console.log("about to send normal questions")
          await sendTextMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
      } 

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);



  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);



  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);



  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {

      let id = chatId; 
      let id2 = convoId; 
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
        id2 = await createConvo(userData.userId, props.route.params.newChatData, id);
        setConvoId(id2);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(id2, id, userData, uploadUrl, replyingTo && replyingTo.key, chatUsers)
      setReplyingTo(null);
      
      setTimeout(() => setTempImageUri(""), 500);
      
    } catch (error) {
      console.log(error);
      
    }
  }, [isLoading, tempImageUri, chatId])


  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      
       
          <PageContainer style={{ backgroundColor: '#0E1528'}}>

            {
              !chatId && <Bubble text="Send a message to activate your new chat!" type="system" />
            }

            {
              errorBannerText !== "" && <Bubble text={errorBannerText} type="error" />
            }

            {
              chatId && 
              <FlatList
                ref={(ref) => flatList.current = ref}
                ////puts chat to the bottom after new message sent
                onContentSizeChange={() => flatList.current.scrollToEnd({ animated: false })}
                //puts chat to the bottom when loaded
                onLayout={() => flatList.current.scrollToEnd({ animated: false })}
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;

                  const isOwnMessage = message.sentBy === userData.userId;
                  const sender = message.sentBy && storedUsers[message.sentBy];
                  const name = sender && `${sender.firstName} ${sender.lastName}`;

                  let messageType;
                  let image;
                  let bigName;
                  if (message.type && message.type === "info") {
                    messageType = "info";
                  } else if (message.type && message.type === "AIMessage"){
                    messageType = "AIMessage";
                    image = message.modelAIPhoto;
                    bigName = message.modelAI
                  } else if (message.type && message.type === "myMessageAI"){
                    messageType = "myMessageAI";
                    image = isOwnMessage ? userData.profilePicture : sender.profilePicture
                    bigName = isOwnMessage ? userData.firstName : name
                  }else if (isOwnMessage) {
                    messageType = "myMessage";
                  }
                  else {
                    messageType = "theirMessage";
                  }
                   
                  
                 

                  if (messageType ==  "AIMessage" || messageType ==  "myMessageAI"){
                    return <MainMessage
                            type={messageType}
                            text={message.text}
                            messageId={message.key}
                            userId={userData.userId}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={bigName}
                            uri={image}
                            setReply={() => setReplyingTo(message)}
                            replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                          />
                  } else {
                    return <Bubble
                            type={messageType}
                            text={message.text}
                            messageId={message.key}
                            userId={userData.userId}
                            chatId={chatId}
                            convoId={convoId}
                            date={message.sentAt}
                            name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                            senderID={ message.sentBy ?  message.sentBy: userData.userId}
                            //convoData={convoData ? convoData : undefined}
                            setReply={() => setReplyingTo(message)}
                            replyingTo={message.replyTo && chatMessages.find(i => i.key === message.replyTo)}
                            imageUrl={message.imageUrl}
                          />
                  }
                  
                }}
              />
            }


          </PageContainer>

          {
            replyingTo &&
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sentBy]}
              onCancel={() => setReplyingTo(null)}
            />
          }

       

        
      <View style={styles.inputContainer}>

          
        {!(activeAI && messageText !== "") && (
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={pickImage}
          >
            <Feather name="plus" size={28} color={'#979797'} />
          </TouchableOpacity>
        )}

          {!(activeAI && messageText !== "") && (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={takePhoto}
              >
                <Feather name="camera" size={25} color={'#979797'} />
              </TouchableOpacity>
          )}
            
        

          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          

          {messageText === "" && (
  
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => setActiveAI(!activeAI)}
              > 
                  {activeAI?
                    <Ionicons name="chatbubble-ellipses-outline" size={30} color={'black'} />
                  :
                  <Ionicons name="chatbubble-ellipses-outline" size={30} color={'#979797'} />
                  }
              </TouchableOpacity>
            
          )}

            


          {messageText === "" &&  (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => setActiveAI(!activeAI)}
              >
                  {activeAI?
                  <MaterialCommunityIcons name="robot-outline" size={30} color={'#979797'} />
                  :
                  <MaterialCommunityIcons name="robot-outline" size={30} color={'black'} />
                  }
              </TouchableOpacity>
            )}

          

          {messageText !== "" && !activeAI &&(
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={"white"} />
              
            </TouchableOpacity>
          )}

          {messageText !== "" && activeAI &&(
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={sendMessage}>
              <Image style={styles.image} source={openAIAvatar} />
            </TouchableOpacity>
          )}

            <AwesomeAlert
              show={tempImageUri !== ""}
              title='Send image?'
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              showConfirmButton={true}
              cancelText='Cancel'
              confirmText="Send image"
              confirmButtonColor={colors.primary}
              cancelButtonColor={colors.red}
              titleStyle={styles.popupTitleStyle}
              onCancelPressed={() => setTempImageUri("")}
              onConfirmPressed={uploadImage}
              onDismiss={() => setTempImageUri("")}
              customView={(
                <View>
                  {
                    isLoading &&
                    <ActivityIndicator size='small' color={colors.primary} />
                  }
                  {
                    !isLoading && tempImageUri !== "" &&
                    <Image source={{ uri: tempImageUri }} style={{ width: 200, height: 200 }} />
                  }
                </View>
              )}
            />


        </View>
        
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor:'#27272C'
  },
  screen: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    color: 'black'
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
    
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    marginHorizontal: 15,
    paddingHorizontal: 12,
    backgroundColor:'#8E8E93'
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  aiButton: {
    backgroundColor: 'black',
    borderRadius: 50,
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,

  },
  popupTitleStyle: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
    color: colors.textColor
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 50,
  }
});

export default ChatScreen;