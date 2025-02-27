This repository is a modified version of the [original from retextjs](https://github.com/adamhollett/retext-usage). It fixes the issue `quotation().join() not a function`, `file.warn() not a function` by calling `file.message()`, add `actual` and `expected`, standardize `ruleId` to match common unified pattern. A reference PR can be found [here](https://github.com/adamhollett/retext-usage/pull/5). Please don't submit issues and PRs and all that stuff here! Not maintained!

# retext-usage

Check phrases for incorrect English usage with [**retext**][retext].

## Usage

```js
var retext = require('retext');
var usage = require('retext-usage');
var report = require('vfile-reporter');

retext()
    .use(usage)
    .process([
        'Repeat ad nauseum.',
        'Get some money from the ATM machine.',
        'This is majorly inappropriate.'
    ].join('\n'), function (err, file) {
        console.log(report(file));
    });
```

Yields:

```txt
<stdin>
   1:8-1:18  warning  Replace “ad nauseum” with “ad nauseam”                      ad nauseum
  2:25-2:36  warning  Replace “ATM machine“ with “ATM”                            ATM machine
   3:9-3:16  warning  Replace “majorly” with “extremely”, or remove it            majorly

⚠ 3 warnings
```

## License

[MIT][license] © [Adam Hollett][author]

<!-- Definitions -->

[releases]: https://github.com/wooorm/retext-usage/releases

[license]: LICENSE

[author]: http://adamhollett.com

[retext]: https://github.com/wooorm/retext
