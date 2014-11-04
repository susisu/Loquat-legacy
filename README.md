# Loquat
JavaScript parser combinator inspired by [Parsec](https://github.com/aslatter/parsec)

## Description
Loquat is a parser combinator library written in JavaScript, available for both Node.js and browsers.
It enables you to write parsers easily, without complex regular expressions.

## Installation and Usage
### Node.js
``` shell
$ npm install loquat
```
Here is a simple parsing example:
``` javascript
var lq = require("loquat");
var result = lq.parse(lq.string("foo"), "name", "foobar");
if (result.succeeded) {
    console.log(result.value);
}
else {
    console.log(result.error.toString());
}
```

### Browsers
Pack the library for browsers:
``` shell
$ git clone https://github.com/susisu/Loquat.git
$ npm install
$ grunt
```
Then `loquat.{version}.js` and `loquat.{version}.min.js` will be placed in `/build`.
You can use them as below:
``` html
<script type="text/javascript" src="./loquat.{version}.min.js"></script>
<script type="text/javascript">
var result = lq.parse(lq.string("foo"), "name", "foobar");
if (result.succeeded) {
    console.log(result.value);
}
else {
    console.log(result.error.toString());
}
</script>
```

## License
[MIT License](http://opensource.org/licenses/mit-license.php)

## TODO
* refine APIs (if necessary)
* document
