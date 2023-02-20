import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';

function formatAmPm(dateString) {
    const date = new Date(dateString);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  }

  function getRandomColor() {
    const colors = ['#6653FF', '#53FF66', '#FF6653', '#BC53FF', '#19C37D', '#FFFF66', 'teal', '#FF6EFF', '#FF9933', '#50BFE6', "#00468C"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

const BoxConvo = props => {

    const { title, subTitle, date, chatName} = props;

    const dateString = date && formatAmPm(date);

    const randomColor = getRandomColor();

    return (
        <TouchableWithoutFeedback style={styles.mainContainer} onPress={props.onPress}>
          <View style={[styles.container, { borderColor: getRandomColor() }]}>
            <View style={styles.header}>
              <Text style={styles.chatName}>{chatName}</Text>
              <Text style={styles.date}>{dateString}</Text>
            </View>
            <View style={styles.content}>
              <Text numberOfLines={2} style={styles.title}>{title}</Text>
              <Text numberOfLines={3} style={styles.subtitle}>{subTitle}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    };
    
    const styles = StyleSheet.create({
        mainContainer:{
        },
      container: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        margin: 15,
        backgroundColor: '#1C2337',
        height: 113,
        width: 170
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        
      },
      chatName: {
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'left',
        color: 'white'
      },
      date: {
        fontSize: 10,
        textAlign: 'right',
        color: 'white'
      },
      content: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
      },
      subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: 'white'
      },
    });
    

export default BoxConvo;