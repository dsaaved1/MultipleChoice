import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';


const MainMessage = props => {
    const { text, type, name} = props;



    const textStyle = { ...styles.text };
    let isUserMessage = false;

    switch (type) {
        case "myMessageAI":
           
            textStyle.fontSize = 13;
            break;
        case "AIMessage":
            
            textStyle.fontSize = 15;
            break;
        default:
            break;
    }


    return (
        <View style={styles.wrapperStyle}>
            <TouchableWithoutFeedback>
           
                <View style={styles.container}>
   
                    
                    <View  style={styles.messageContainer}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>{name}</Text>
                        
                    
                        </View>
                    

                        <View style={styles.textContainer}>
                            <Text style={textStyle}>
                                {text}
                            </Text>
                    
                        </View>

                    </View>
                


                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapperStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: "100%"
    },
    container: {
        paddingVertical: 5,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
      messageContainer: {
        flex: 1,
      },
      textContainer:{
        marginTop: 5
      },
    text: {
        letterSpacing: 0.3,
        fontFamily :'bold',
        color:'white'
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
    name: {
        fontFamily :'blackLato',
        letterSpacing: 0.3,
        color: colors.lightGrey,
        fontSize: 16
    }
})

export default MainMessage;