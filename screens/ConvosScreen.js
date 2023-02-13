import { View, Text, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import { createConvo } from "../utils/actions/chatActions";
import colors from "../constants/colors";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const ConvosScreen = (props) => {
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [chatData, setChatData] = useState(props.route?.params?.newChatData);
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


  return (
    <View style={styles.container}>
      {chatConvos.map(convo => (
        <TouchableOpacity 
          key={convo.key} 
          style={styles.card} 
          onPress={() => props.navigation.navigate("ChatScreen", { convoId: convo.key, chatId: chatId, newChatData: chatData }) }
        >
          <View style={styles.cardInner}>
              <Text>{convo.convoName}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity  
          style={styles.card} 
          onPress={() => createConvo(userData.userId, chatData, chatId) }
        >
        <View style={styles.cardInner}>
            <Ionicons name="ios-add" size={30} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      card: {
        width: 100,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
      },
      cardInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
});

export default ConvosScreen