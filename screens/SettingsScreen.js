import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useMemo, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ProfileImage from '../components/ProfileImage';
import SubmitButton from '../components/SubmitButton';
import colors from '../constants/colors';
import { updateLoggedInUserData } from '../store/authSlice';
import { updateSignedInUserData, userLogout } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';


const SettingsScreen = props => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const userData = useSelector(state => state.auth.userData);
    const starredMessages = useSelector(state => state.messages.starredMessages ?? {});
    const sortedStarredMessages = useMemo(() => {
        let result = [];

        const convos = Object.values(starredMessages);

        convos.forEach(convo => {
            const chatMessages = Object.values(convo);
            result = result.concat(chatMessages);
        })

        return result;
    }, [starredMessages]);
    
    const firstName = userData.firstName || "";
    const lastName = userData.lastName || "";
    const email = userData.email || "";
    const about = userData.about || "";

    const initialState = {
        inputValues: {
            firstName,
            lastName,
            email,
            about,
        },
        inputValidities: {
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            about: undefined,
        },
        formIsValid: false
    }

    useEffect(() => {
        props.navigation.setOptions({
            headerStyle: {
              backgroundColor: '#0E1528', 
            },
            headerLeft: () => {
                return <PageTitle text="  Settings" />
            }
    })
    }, []);

    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    const saveHandler = useCallback(async () => {
        const updatedValues = formState.inputValues;
        
        try {
            setIsLoading(true);
            await updateSignedInUserData(userData.userId, updatedValues);
            dispatch(updateLoggedInUserData({newData: updatedValues}));

            setShowSuccessMessage(true);

            setTimeout(() => {
                setShowSuccessMessage(false)
            }, 3000);
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [formState, dispatch]);

    const hasChanges = () => {
        const currentValues = formState.inputValues;

        return currentValues.firstName != firstName ||
            currentValues.lastName != lastName || 
            currentValues.email != email ||
            currentValues.about != about;
    }
    
    return <PageContainer>
        

        <ScrollView contentContainerStyle={styles.formContainer}>

            <ProfileImage
                size={90}
                userId={userData.userId}
                uri={userData.profilePicture}
                showEditButton={true} />

            <Input
                id="firstName"
                label="First name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["firstName"]}
                initialValue={userData.firstName} />

            <Input
                id="lastName"
                label="Last name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["lastName"]}
                initialValue={userData.lastName} />

            <Input
                id="email"
                label="Email"
                icon="mail"
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                keyboardType="email-address"
                autoCapitalize="none"
                errorText={formState.inputValidities["email"]}
                initialValue={userData.email} />

            <Input
                id="about"
                label="About"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["about"]}
                initialValue={userData.about} />

            <View style={{ marginTop: 20 }}>
                {
                    showSuccessMessage && <Text>Saved!</Text>
                }

            {
                isLoading ? 
                <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
                hasChanges() && <SubmitButton
                    title="Save"
                    onPress={saveHandler}
                    style={{ marginTop: 20 }}
                    disabled={!formState.formIsValid} />
            }
            </View>

            <DataItem
                type={"link"}
                title="Starred messages"
                hideImage={true}
                onPress={() => props.navigation.navigate("DataList", { title: "Starred messages", data: sortedStarredMessages, type: "messages" })}
            />

            <SubmitButton
                title="Logout"
                onPress={() => dispatch(userLogout(userData)) }
                style={{ marginTop: 20 }}
                color={colors.red}/>

        </ScrollView>   
    </PageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: { 
        alignItems: 'center'
    }
})

export default SettingsScreen;