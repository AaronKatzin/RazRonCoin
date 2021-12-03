var bloom = require('./bloomfilter.js');

//arguments:
//1.probable number of elements in the filter.
//2.optional false_postive_tolerance argument
var filter = new bloom(100,0.00001); 

filter.add("razi");
filter.add("aaron");
filter.add("banana");

console.log(filter.test("apple"));	//false		
console.log(filter.test("orange"));	//false
console.log(filter.test("razi"));	//true
console.log(filter.test("aaron"));	//true
console.log(filter.test("banana")); //true

//serialization
var json = filter.serialize();

//deserialization
var deserialized_filter = bloom.deserialize(json);