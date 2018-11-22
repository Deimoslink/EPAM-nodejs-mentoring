export default class User {

	constructor(name) {
		console.log('User module added');
		this.name = name;
	}

	greeting() {
		console.log(`Hello, ${this.name}`);
	}

}
