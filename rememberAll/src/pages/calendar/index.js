/* eslint-disable no-console */
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Slider,
    TouchableWithoutFeedback,
    Dimensions,
    SafeAreaView,
    CameraRoll,
    Button
} from 'react-native';
import Icon from "react-native-vector-icons/dist/MaterialIcons";
import Header from "../../components/header";
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {sortByTime} from "../../database/schemas";

const { width, height } = Dimensions.get('window');


export default class MyCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           markedDates: {},
            hasMarked: false,
            startDay: '',
            endDay: '',
            stopMark: false,
        };
    }
    goBack = () => {
        this.props.navigation.goBack();
    };
    goBackAndSort = (notes) => {
        console.log('goBack');
        this.props.navigation.goBack();
        this.props.navigation.state.params.showSortedNotes(notes);
    };

    sortNotes = (startDay, endDay) => {
        sortByTime(startDay.dateString, endDay.dateString).then((notes) => {
            this.goBackAndSort(notes)
        })
    };

    dayPressed = (day) => {
        const newMarkedDates = Object.assign({}, this.state.markedDates);
        if (!this.state.hasMarked) {
            newMarkedDates[[day.dateString]] = {selected: true, startingDay: true, color: 'green', textColor: 'gray'};
            console.log(newMarkedDates);
            this.setState({
                    hasMarked: true,
                    startDay: day,
                    markedDates: newMarkedDates
                });
        } else if (!this.state.stopMark){
            newMarkedDates[[day.dateString]] = {customStyles: {
                    container: {
                        backgroundColor: '#FF5722',
                    },
                },selected: true, endingDay: true, textColor: 'gray'};
            console.log(newMarkedDates);
            this.setState({
                endDay: day,
                markedDates: newMarkedDates,
                stopMark: true,
            });
            this.sortNotes(this.state.startDay, day);
        }
    };

    render() {
        console.log('state', JSON.stringify(this.state.markedDates)  );

        return <SafeAreaView style={styles.container}>
            <Header leftElement={
                <TouchableOpacity
                    onPress={this.goBack}
                    style={{width: 45, marginLeft: 10}}>
                    <Icon name="keyboard-arrow-left" size={45} color="#FF5722"/>
                </TouchableOpacity>
            } titleElement='Calender'/>

            <Calendar
                // Handler which gets executed on day press. Default = undefined
                onDayPress={this.dayPressed}
                // Handler which gets executed on day long press. Default = undefined
                onDayLongPress={(day) => {console.log('selected day', day)}}
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'yyyy MM'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => {console.log('month changed', month)}}
                // Hide month navigation arrows. Default = false
                hideArrows={false}
                // Replace default arrows with custom ones (direction can be 'left' or 'right')
                // renderArrow={(direction) => (<Arrow />)}
                // Do not show days of other months in month page. Default = false
                hideExtraDays={false}
                // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
                // day from another month that is visible in calendar page. Default = false
                disableMonthChange={false}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={true}
                // Show week numbers to the left. Default = false
                showWeekNumbers={true}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                onPressArrowLeft={substractMonth => substractMonth()}
                // Handler which gets executed when press arrow icon left. It receive a callback can go next month
                onPressArrowRight={addMonth => addMonth()}
                markingType={'custom'}
                markedDates={this.state.markedDates}
                minDate={this.state.startDay}
                maxDate={this.state.endDay}
            />
                {/*<View style={{alignItems: 'center'}}><Text style={{fontSize: 20}}>{this.state.startDay.dateString}</Text></View>*/}
                {/*<View style={{alignItems: 'center'}}><Text style={{fontSize: 20}}>{this.state.endDay.dateString}</Text></View>*/}

        </SafeAreaView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
