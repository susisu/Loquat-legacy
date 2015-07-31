# Loquat
JavaScript monadic parser combinators inspired by Haskell's [Parsec](https://github.com/aslatter/parsec).

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
Install with `bower`:
``` shell
$ bower install susisu/Loquat
```
``` html
<script type="text/javascript" src="./bower_components/loquat/dist/loquat.min.js"></script>
<script type="text/javascript">
var result = loquat.parse(loquat.string("foo"), "name", "foobar");
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

