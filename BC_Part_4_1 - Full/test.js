var bloom = require('./bloomfilter.js');

//arguments:
//1.probable number of elements in the filter.
//2.optional false_postive_tolerance argument
var filter = new bloom(100); 

filter.add("razi");
filter.add("aaron");
filter.add("banana");
filter.add("apple");

console.log(filter.test("apple"));	//true		
console.log(filter.test("orange"));	//false
console.log(filter.test("razi"));	//true
console.log(filter.test("aaron"));	//true
console.log(filter.test("banana")); //true
console.log(filter.test("banana1")); //false

//serialization
var json = filter.serialize();

//deserialization
var deserialized_filter = bloom.deserialize(json);