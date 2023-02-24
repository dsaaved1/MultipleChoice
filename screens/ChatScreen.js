import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { AntDesign } from '@expo/vector-icons';

import colors from "../constants/colors";
import openAIAvatar from '../assets/images/openai-avatar.png';

import PageContainer from "../components/PageContainer";
import MainMessage from "../components/MainMessage";
import ReplyTo from "../components/ReplyTo";
import SubmitButton from '../components/SubmitButton';

import { useSelector,  useDispatch } from "react-redux";
import { sendImage, sendAIMessage, sendQuestionGPT3 } from "../utils/actions/chatActions";
import { launchImagePicker, uploadImageAsync } from "../utils/imagePickerHelper";
import AwesomeAlert from 'react-native-awesome-alerts';
import { updateConvoData } from '../utils/actions/chatActions';
import { userLogout } from '../utils/actions/authActions';



const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState('-NP3_OTpM51XAqvg93wJ');
  const [convoId, setConvoId] = useState('-NP3_OUc1yD8HnLcugXI');
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(false)
  const [nameAI, setNameAI] = useState('GPT-3');

  //we use this to create a reference to component
  // and scrolling the chat to the bottom new message
  const flatList = useRef();

  const dispatch = useDispatch();

  const userData = useSelector(state => state.auth.userData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const storedChats = useSelector(state => state.chats.chatsData);
  const chatData = (chatId && storedChats[chatId])
  const convoRef = (chatId && useSelector(state => state.convos.convosData[chatId]))
  const convoData = convoRef[convoId]
  const [title, setTitle] = useState(convoData.convoName);

  const chatMessages = useSelector(state => {
    const chatMessagesData = state.messages.messagesData[convoId];

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



  useEffect(() => {

    const subTitle = chatData.chatName;
  
    props.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', margin: 5 }}>
          {editing?
           <TextInput style={{ color: 'white', fontSize: 20, fontWeight: 'medium' }}
           autoFocus={true}
           onChangeText={text => setTitle(text)}
           value={title}></TextInput>
          :
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'medium' }}>
            {title}
          </Text>
          }
          <Text style={{ color: '#979797', fontSize: 12, fontWeight: 'regular' }}>
            {subTitle}
          </Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#0E1528', 
      },
      headerRight: 
    () => {
      if (editing) {
        return (
          <TouchableOpacity onPress={() => {
            updateConvoData(convoId,chatId,title);
            setEditing(false);
          }}>
            <AntDesign name="checkcircleo" size={24} color='#979797'/>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Feather name="edit-3" size={24} color='#979797' />
          </TouchableOpacity>
        );
        }
    },
    headerLeft: () => {
      return <SubmitButton
                title="Logout"
                onPress={() => dispatch(userLogout(userData)) }
                style={{ marginTop: 20 }}
                color={colors.red}/>
    } 

    })
    setChatUsers(chatData.users)
    //editing is passed because I wanted to be the page reload after editing is change inside useEffect
  }, [chatUsers, editing, title])



  const sendMessage = useCallback(async () => {

    try {
      let id = chatId;
      let id2 = convoId;

      
      console.log("about to send ai questions")
      await sendAIMessage(id2, id, userData, messageText, replyingTo && replyingTo.key, chatUsers);
      setMessageText("");
      await sendQuestionGPT3(id2, id, userData.userId, messageText)
      

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




  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {

      let id = chatId; 
      let id2 = convoId; 

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

                  let messageType;
                  let image;
                  let bigName;
                  if (message.type && message.type === "AIMessage"){
                    messageType = "AIMessage";
                    image = message.modelAIPhoto;
                    bigName = message.modelAI
                  } else if (message.type && message.type === "myMessageAI"){
                    messageType = "myMessageAI";
                    image = userData.profilePicture
                    bigName = userData.firstName
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

          
        {!(messageText !== "") && (
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={pickImage}
          >
            <Feather name="plus" size={28} color={'#979797'} />
          </TouchableOpacity>
        )}


        

          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />



          {messageText !== "" && (
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
    backgroundColor:'#27272C',
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