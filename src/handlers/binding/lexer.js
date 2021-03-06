var _ = require('underscore'),
    tokens = [
        [/^empty\b/, 'empty'],
        ['(', 'lparen'],
        [')', 'rparen'],
        ['[', 'lbracket'],
        [']', 'rbracket'],
        ['+', 'plus'],
        ['-', 'minus'],
        ['*', 'times'],
        ['/', 'slash'],
        ['?', 'qmark'],
        [':', 'colon'],
        ['&&', 'and'],
        ['||', 'or'],
        ['==', 'eq'],
        ['!=', 'neq'],
        ['>=', 'gte'],
        ['<=', 'lte'],
        ['>', 'gt'],
        ['<', 'lt'],
        ['!', 'not'],
        [/^[a-zA-Z_]+[\w]*(\.[a-zA-Z_]+[\w]*)*/, 'ident'],
        [/^\d*(\.\d+)*/, 'number'],
        [/^'.*?'/, 'sqliteral'],
        [/^".*?"/, 'dqliteral'],
        [/^\s+/, 'whitespace', true]
    ],
    tokenNames = _.chain(tokens)
        .map(function (token) {
            return [token[1], token[1]];
        })
        .object()
        .value();

function matchToken(remain) {
    var i, token, match, value;

    for (i = 0; i < tokens.length; i ++) {
        token = tokens[i];

        if (_.isObject(token[0])) {
            match = remain.match(token[0]);
            value = match && match[0];
        } else if(remain.substring(0, token[0].length) === token[0]) {
            value = token[0];
        }

        if (value) {
            return {
                value: value,
                name: token[1],
                ignored: token.length > 2 && token[2]
            };
        }
    }

    throw {
        message: 'unrecognized token at \n\t' + remain
    };
}

function lexer(expression) {

    var remain = expression,
        result = [],
        token;

    while (remain.length) {
        try {
            token = matchToken(remain);
        } catch (ex) {
            throw {
                message: 'error parsing expression',
                expression: expression,
                ex: ex
            };
        }
        remain = remain.substring(token.value.length);

        if (!token.ignored) {
            result.push(_.omit(token, 'ignored'));
        }
    }

    return result;
}

module.exports = {
    lex: lexer,
    tokens: tokenNames
};