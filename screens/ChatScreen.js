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
import SubmitButton from '../components/SubmitButton';

import { useSelector,  useDispatch } from "react-redux";
import { sendAIMessage, sendQuestionDavinci} from "../utils/actions/chatActions";
import { userLogout } from '../utils/actions/authActions';



const ChatScreen = (props) => {
  

  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState('-NP4_nJEuK5ztXjI5-1H');
  const [convoId, setConvoId] = useState('-NP4_nJEuK5ztXjI5-1H');
  const userData = useSelector(state => state.auth.userData);
  const [title, setTitle] = useState('Chat')

  const flatList = useRef();

  const dispatch = useDispatch();

 

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

  
    props.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', margin: 5 }}>

          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'medium' }}>
            {title}
          </Text>
          
        </View>
      ),
      headerStyle: {
        backgroundColor: '#0E1525', 
      },
    headerLeft: () => {
      return <SubmitButton
                title="Logout"
                onPress={() => dispatch(userLogout(userData)) }
                color={colors.red}/>
    } 

    })
    
    //editing is passed because I wanted to be the page reload after editing is change inside useEffect
  }, [title])



  const sendMessage = useCallback(async () => {

    try {
      let id = chatId;
      let id2 = convoId;

      
      console.log("about to send ai questions")
      await sendAIMessage(id2, id, userData, messageText);
      setMessageText("");
      await sendQuestionDavinci(id2, id, userData.userId, messageText)
      

      setMessageText("");
      setReplyingTo(null);

    } catch (error) {
      
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);



  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      
       
          <PageContainer >

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
                  
                  let bigName;
                  if (message.type && message.type === "AIMessage"){
                    messageType = "AIMessage";
                    bigName = message.model
                  } else if (message.type && message.type === "myMessageAI"){
                    messageType = "myMessageAI";
                    bigName = userData.firstName
                  }
                   
                  

                  if (messageType ==  "AIMessage" || messageType ==  "myMessageAI"){
                    return <MainMessage
                            type={messageType}
                            text={message.text}
                            name={bigName}
                          />
                  }
                  
                }}
              />
            }


          </PageContainer>


       

        
      <View style={styles.inputContainer}>


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