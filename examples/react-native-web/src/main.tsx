import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('GuideLoopRNWebExample', () => App);
AppRegistry.runApplication('GuideLoopRNWebExample', {
  rootTag: document.getElementById('root'),
});
