import {User, Product} from './models';
import {default as config} from './config/config.json';

const user = new User('Aleksandr');
const product = new Product();

user.greeting();

console.log('app works, here is the config:', config);
