// Main Screens for Drawer Navigator
import { createStackNavigator,  createAppContainer} from 'react-navigation';

import HomePage from '../pages/homePage/index';
import NewNote from '../pages/newNote/index';
import Login from '../pages/login/index';
import VideoOperation from '../pages/videoOperation/index'
import Register from '../pages/Register/index'
import MyCalendar from  '../pages/calendar/index'

const AppRouter = createStackNavigator({
    Login: {
        screen: Login,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Register: {
        screen: Register,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    Home: {
        screen: HomePage,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    MyCalendar: {
        screen: MyCalendar,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    NewNote: {
        screen: NewNote,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
    VideoOperation: {
        screen: VideoOperation,
        navigationOptions: {
            header: null,
            gesturesEnabled: false
        }
    },
}, {
    initialRouteName: 'Login',
});


export default createAppContainer(AppRouter);