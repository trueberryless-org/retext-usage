/**
 * @author Titus Wormer
 * @copyright 2014-2015 Titus Wormer
 * @license MIT
 * @module retext:usage:extract
 * @fileoverview Extract and compile database into JSON.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var duplicated = require('array-duplicated');
var yaml = require('js-yaml');

/*
 * Methods.
 */

var join = path.join;
var read = fs.readFileSync;
var write = fs.writeFileSync;
var stringify = JSON.stringify;

/**
 * Get a unique identifier for a pattern.
 *
 * @param {Object} pattern - Pattern to generate for.
 * @return {string} - Pattern identifier.
 */
function getPatternId(pattern) {
    var incorrect = pattern.incorrect;
    var phrases = {};
    var result = [];
    var phrase;
    var category;

    for (phrase in incorrect) {
        category = incorrect[phrase];

        if (!phrases[category] || phrases[category].length > phrase.length) {
            phrases[category] = phrase;
        }
    }

    for (phrase in phrases) {
        result.push(phrases[phrase].replace(/\s/, '-'));
    }

    return result.sort().join('-');
}

/**
 * Patch information on `entry`.
 *
 * @param {Object} entry - Thing.
 */
function patch(entry) {
    var description = entry.note;
    var source = entry.source;
    var result = {
        'id': null,
        'type': entry.type,
        'apostrophe': entry.apostrophe ? true : undefined,
        'categories': entry.categories,
        'correct': entry.correct,
        'incorrect': entry.incorrect
    };

    if (source) {
        if (description) {
            description += ' (source: ' + source + ')';
        } else {
            description = 'Source: ' + source;
        }
    }

    result.note = description;
    result.id = getPatternId(result);

    return result;
}

/*
 * Gather.
 */

var data = [
    'usage'
].map(function (name) {
    return yaml.load(read(join(__dirname, name + '.yml'), 'utf8'));
});

data = [].concat.apply([], data);

/**
 * Clean a value.
 *
 * @param {string|Array.<string>|Object} value - Either a
 *   phrase, list of phrases, or a map of phrases mapping
 *   to categories.
 * @return {Object} - Normalized `value`.
 */
function clean(value) {
    var copy;

    if (typeof value === 'string') {
        value = [value];
    }

    if (value.length) {
        copy = value;
        value = {};

        copy.forEach(function (phrase) {
            value[phrase] = 'a' /* example category */;
        });
    }

    return value;
}

data.forEach(function (entry) {
    entry.incorrect = clean(entry.incorrect);
    entry.correct = clean(entry.correct);
    entry.categories = Object.keys(entry.incorrect).map(function (key) {
        return entry.incorrect[key];
    }).filter(function (value, index, parent) {
        return parent.indexOf(value, index + 1) === -1;
    });
});

/*
 * Patch.
 */

var phrases = [];

data = data.map(patch);

data.forEach(function (entry) {
    if (entry.type !== 'simple' && entry.categories.length < 2) {
        throw new Error(
            'Use `type: simple` for single entries with one category: ' +
            Object.keys(entry.incorrect).join(', ')
        );
    }

    if (entry.incorrect) {
        Object.keys(entry.incorrect).forEach(function (incorrect) {
            phrases.push(incorrect);

            if (/-/.test(incorrect)) {
                throw new Error(
                    'Refrain from using dashes inside incorrect ' +
                    'terms: they’ll be stripped when looking for ' +
                    'words: ' +
                    Object.keys(entry.incorrect).join(', ')
                );
            }

            if (/['’]/.test(incorrect) && !entry.apostrophe) {
                throw new Error(
                    'Refrain from using apostrophes inside ' +
                    'incorrect terms, they’ll be stripped ' +
                    'when looking for words (or use `apostrophe: ' +
                    'true`): ' +
                    Object.keys(entry.incorrect).join(', ')
                );
            }
        });
    }
});

var duplicates = duplicated(phrases);

if (duplicates.length) {
    throw new Error(
        'Refrain from multiple entries:\n' +
        '  ' + duplicates.join(', ')
    );
}

/*
 * Write.
 */

data = stringify(data, 0, 2) + '\n';

write(join(__dirname, '..', 'lib', 'patterns.json'), data);
