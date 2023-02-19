import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from 'react-redux';
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import { createConvo } from "../utils/actions/chatActions";
import colors from "../constants/colors";
import { Ionicons } from '@expo/vector-icons';


import DataItem from '../components/DataItem';

const ConvosScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const chatId = props.route?.params?.chatId;
  const [convoId, setConvoId] = useState(props.route?.params?.convoId);
  const storedChats = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};
  const userData = useSelector(state => state.auth.userData);
  
  //chatConvos = [{key: "-NSFDLKSDKD", sentAt: "2022", ...},{}]
  const chatConvos = useSelector(state => {
    if (!chatId) return [];

    const chatConvosData = state.convos.convosData[chatId];

    if (!chatConvosData) return [];

    const convoList = [];
    //key is convoId
    for (const key in chatConvosData) {
      //convo is convo Data (fields)
      const convo = chatConvosData[key];

      convoList.push({
        //below is the same key: key
        key,
        ...convo
      });

    }

    return convoList;
  });

  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  }

  useEffect(() => {
    if (!chatData) return;

    
    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(),
      headerRight: () => {
        return <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          {
            chatId && 
            <Item
              title="Chat settings"
              iconName="settings-outline"
              onPress={() => chatData.isGroupChat ?
                props.navigation.navigate("ChatSettings", { chatId }) :
                props.navigation.navigate("Contact", { uid: chatUsers.find(uid => uid !== userData.userId) })}
            />
          }
        </HeaderButtons>
      }
    })
    setChatUsers(chatData.users)
  }, [chatUsers])

  const handlePressConvo = (convoKey) => {
    setConvoId(convoKey);
    props.navigation.navigate("ChatScreen", { convoId: convoKey, chatId: chatId, newChatData: chatData });
  }

  return <PageContainer>
      <PageTitle text="Conversations" />
      
        <View>
          <TouchableOpacity onPress={() => {}}>
              <Text style={styles.newGroupText}>New Category</Text>
          </TouchableOpacity>
        </View>
    
        {Object.entries(chatConvos.reduce((obj, convo) => {
        if (!obj[convo.category]) obj[convo.category] = [];
        obj[convo.category].push(convo);
        return obj;
      }, {})).map(([category, convos]) => (
        <View style={styles.category}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            horizontal
            data={convos}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.key}
                style={styles.convoContainer}
                onPress={() => handlePressConvo(item.key)}
              >
                  <View style={styles.convo}>
                    <Text numberOfLines={3} style={styles.convoName}>{item.convoName}</Text>
                    <Text numberOfLines={3} style={styles.latestAIText}>{item.latestAIText}</Text>
                    <Text numberOfLines={2} style={styles.latestMessageText}>{item.latestMessageText}</Text>
                  </View>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                keyExtractor={item => item.timestamp}
                style={styles.card}
                onPress={() => createConvo(userData.userId,chatData,chatId)}
              >
                <View style={styles.cardInner}>
                  <Ionicons name="ios-add" size={30} color="#fff" />
                </View>
              </TouchableOpacity>
            }
          />
        </View>
))}

    
    </PageContainer>
  
}

const styles = StyleSheet.create({
      newGroupText: {
        color: colors.blue,
        fontSize: 17,
        marginBottom: 10
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    convoContainer: {
      margin: 10,
    },
    card: {
      backgroundColor: colors.primary,
      borderRadius: 5,
      width: 110,
      height: 150,
      margin: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardInner: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    convo: {
      width: 110,
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    convoName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    latestAIText: {
      fontSize: 13,
      color: '#666',
      marginBottom: 5,
    },
    latestMessageText: {
      fontSize: 10,
      color: '#999',
      marginBottom: 5,
    },
});

export default ConvosScreen