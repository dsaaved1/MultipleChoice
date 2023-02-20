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

  function getRandomColor() {
    const colors = ['#6653FF', '#53FF66', '#FF6653', '#BC53FF', '#19C37D', '#FFFF66', 'teal', '#FF6EFF', '#FF9933', '#50BFE6', "#00468C"];
    return colors[Math.floor(Math.random() * colors.length)];
  }



  useEffect(() => {
    if (!chatData) return;

    const leftTitle = chatData.chatName ?? getChatTitleFromName();
    props.navigation.setOptions({
      headerTitle: leftTitle,
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: '#0E1528', 
      },
      headerLeft: () => {
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <PageTitle text={leftTitle} />
          </TouchableOpacity>
      },
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
    props.navigation.navigate("ChatScreen", { convoId: item.key, chatId: chatId, newChatData: chatData });
  }

  const sortedConvos = chatConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));


  return <PageContainer>

            <View style={styles.groupContainer}>
                <Text style={styles.groupText}>Conversations</Text>

                <View style={styles.rightContainer}>

                    <TouchableOpacity onPress={() => props.navigation.navigate("NewChat", { isGroupChat: true })} style={styles.button}>
                        <Text style={styles.buttonText}>New Convo</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <FlatList
              data={sortedConvos}
              renderItem= {({ item }) => (

                <View>
                  <View style={styles.imageContainer}>
                    
                  </View>

                  <TouchableOpacity onPress={() => props.navigation.navigate("ChatScreen", { convoId: item.key, chatId: chatId, newChatData: chatData })}>
                      <View style={styles.textContainer}>

                          <Text
                              numberOfLines={1}
                              style={styles.title}>
                              {item.convoName}
                          </Text>


                          <Text
                              numberOfLines={1}
                              style={styles.subTitle}>
                              {item.latestMessageText}
                          </Text>


                      </View>
                      
                    </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.key}
            />
    
      
        {/* {Object.entries(chatConvos.reduce((obj, convo) => {
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
))} */}

    
    </PageContainer>
  
}

const styles = StyleSheet.create({
  textContainer: {
    marginLeft: 14,
    flex: 1
},
title: {
    fontFamily: 'medium',
    fontSize: 16,
    letterSpacing: 0.3,
    color: 'white',
},
subTitle: {
    fontFamily: 'regular',
    color: colors.grey,
    letterSpacing: 0.3,
    fontSize: 12,
    marginTop:5
},
    groupContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    groupText: {
      fontSize: 19,
      fontFamily: 'bold',
      color: 'white',
    },
    rightContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end'
    },
    button: {
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    buttonText: {
      fontSize: 12,
      fontFamily: 'medium',
      color: 'white',
      backgroundColor: 'transparent',
      mixBlendMode: 'overlay',
      opacity: 0.5,
    },
});

export default ConvosScreen