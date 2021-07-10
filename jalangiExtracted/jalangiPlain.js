/*
 Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
 Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
 Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
 Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
 Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
 Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
 Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
 Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
 Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
 Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
 Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (global) {

    'use strict';

    var isArray,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        FORMAT_MINIFY,
        FORMAT_DEFAULTS;

    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportBatchSpecifier: 'ExportBatchSpecifier',
        ExportDeclaration: 'ExportDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportSpecifier: 'ImportSpecifier',
        ImportDeclaration: 'ImportDeclaration',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleDeclaration: 'ModuleDeclaration',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    var Precedence = {
        Sequence: 0,
        Yield: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        TaggedTemplate: 17,
        Member: 18,
        Primary: 19
    };

    var BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            format: {
                indent: {
                    style: '    ',
                    base: 0
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            },
            directive: false,
            raw: true,
            verbatim: null
        };
    }

//-------------------------------------------------===------------------------------------------------------
//                                            Lexical utils
//-------------------------------------------------===------------------------------------------------------

//Const
    var NON_ASCII_WHITESPACES = [
        0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
        0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000,
        0xFEFF
    ];

//Regular expressions
    var NON_ASCII_IDENTIFIER_CHARACTERS_REGEXP = new RegExp(
        '[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376' +
        '\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-' +
        '\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA' +
        '\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-' +
        '\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-' +
        '\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-' +
        '\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-' +
        '\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38' +
        '\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83' +
        '\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9' +
        '\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-' +
        '\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-' +
        '\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E' +
        '\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-' +
        '\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-' +
        '\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-' +
        '\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE' +
        '\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44' +
        '\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-' +
        '\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A' +
        '\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-' +
        '\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9' +
        '\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84' +
        '\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-' +
        '\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5' +
        '\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-' +
        '\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-' +
        '\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD' +
        '\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B' +
        '\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E' +
        '\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-' +
        '\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-' +
        '\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-' +
        '\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F' +
        '\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115' +
        '\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188' +
        '\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-' +
        '\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-' +
        '\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A' +
        '\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5' +
        '\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697' +
        '\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873' +
        '\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-' +
        '\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-' +
        '\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC' +
        '\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-' +
        '\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D' +
        '\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74' +
        '\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-' +
        '\uFFD7\uFFDA-\uFFDC]'
    );


//Methods
    function isIdentifierCh(cp) {
        if (cp < 0x80) {
            return cp >= 97 && cp <= 122 ||      // a..z
                   cp >= 65 && cp <= 90 ||       // A..Z
                   cp >= 48 && cp <= 57 ||       // 0..9
                   cp === 36 || cp === 95 ||     // $ (dollar) and _ (underscore)
                   cp === 92;                    // \ (backslash)
        }

        var ch = String.fromCharCode(cp);

        return NON_ASCII_IDENTIFIER_CHARACTERS_REGEXP.test(ch);
    }

    function isLineTerminator(cp) {
        return cp === 0x0A || cp === 0x0D || cp === 0x2028 || cp === 0x2029;
    }

    function isWhitespace(cp) {
        return cp === 0x20 || cp === 0x09 || isLineTerminator(cp) || cp === 0x0B || cp === 0x0C || cp === 0xA0 ||
               (cp >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(cp) >= 0);
    }

    function isDecimalDigit(cp) {
        return cp >= 48 && cp <= 57;
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }


    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        //NOTE: 0x30 == '0'
        if (!json && result.charCodeAt(0) === 0x30 && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;

        //NOTE: 0x30 == '0'
        while (temp.charCodeAt(temp.length + pos - 1) === 0x30) {
            --pos;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
             (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length
                                                                            < result.length)) &&
            +temp === value) {
            result = temp;
        }

        return result;
    }

// Generate valid RegExp expression.
// This function is based on https://github.com/Constellation/iv Engine

    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & ~1) === 0x2028) {
            return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {  // \n, \r
            return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
    }

    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

        result = reg.toString();

        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) {
                return result;
            }

            flags = match[1];
            result = '';

            characterInBrack = false;
            previousIsBackslash = false;
            for (i = 0, iz = reg.source.length; i < iz; ++i) {
                ch = reg.source.charCodeAt(i);

                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) {  // ]
                            characterInBrack = false;
                        }
                    } else {
                        if (ch === 47) {  // /
                            result += '\\';
                        } else if (ch === 91) {  // [
                            characterInBrack = true;
                        }
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92;  // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }

            return '/' + result + '/' + flags;
        }

        return result;
    }

    function escapeAllowedCharacter(code, next) {
        var hex, result = '\\';

        switch (code) {
            case 0x08:          // \b
                result += 'b';
                break;
            case 0x0C:          // \f
                result += 'f';
                break;
            case 0x09:          // \t
                result += 't';
                break;
            default:
                hex = code.toString(16).toUpperCase();
                if (json || code > 0xFF) {
                    result += 'u' + '0000'.slice(hex.length) + hex;
                }

                else if (code === 0x0000 && !isDecimalDigit(next)) {
                    result += '0';
                }

                else if (code === 0x000B) {     // \v
                    result += 'x0B';
                }

                else {
                    result += 'x' + '00'.slice(hex.length) + hex;
                }
                break;
        }

        return result;
    }

    function escapeDisallowedCharacter(code) {
        var result = '\\';
        switch (code) {
            case 0x5C       // \
            :
                result += '\\';
                break;
            case 0x0A       // \n
            :
                result += 'n';
                break;
            case 0x0D       // \r
            :
                result += 'r';
                break;
            case 0x2028:
                result += 'u2028';
                break;
            case 0x2029:
                result += 'u2029';
                break;
        }

        return result;
    }

    function escapeDirective(str) {
        var i, iz, code, quote;

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = str.length; i < iz; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27) {            // '
                quote = '"';
                break;
            } else if (code === 0x22) {     // "
                quote = '\'';
                break;
            } else if (code === 0x5C) {     // \
                ++i;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
        //TODO http://jsperf.com/character-counting/8
        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27) {           // '
                ++singleQuotes;
            } else if (code === 0x22) { // "
                ++doubleQuotes;
            } else if (code === 0x2F && json) { // /
                result += '\\';
            } else if (isLineTerminator(code) || code === 0x5C) { // \
                result += escapeDisallowedCharacter(code);
                continue;
            } else if ((json && code < 0x20) ||                                     // SP
                       !(json || escapeless || (code >= 0x20 && code <= 0x7E))) {   // SP, ~
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        quote = single ? '\'' : '"';

        if (!(single ? singleQuotes : doubleQuotes)) {
            return quote + result + quote;
        }

        str = result;
        result = quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if ((code === 0x27 && single) || (code === 0x22 && !single)) {    // ', "
                result += '\\';
            }
            result += String.fromCharCode(code);
        }

        return result + quote;
    }


    function join(l, r) {
        if (!l.length)
            return r;

        if (!r.length)
            return l;

        var lCp = l.charCodeAt(l.length - 1),
            rCp = r.charCodeAt(0);

        if (isIdentifierCh(lCp) && isIdentifierCh(rCp) ||
            lCp === rCp && (lCp === 0x2B || lCp === 0x2D) ||   // + +, - -
            lCp === 0x2F && rCp === 0x69) {                    // /re/ instanceof foo
            return l + _.space + r;
        }

        else if (isWhitespace(lCp) || isWhitespace(rCp))
            return l + r;

        return l + _.optSpace + r;
    }

    function shiftIndent() {
        var prevIndent = _.indent;

        _.indent += _.indentUnit;
        return prevIndent;
    }

    function adoptionPrefix($stmt) {
        if ($stmt.type === Syntax.BlockStatement)
            return _.optSpace;

        if ($stmt.type === Syntax.EmptyStatement)
            return '';

        return _.newline + _.indent + _.indentUnit;
    }

    function adoptionSuffix($stmt) {
        if ($stmt.type === Syntax.BlockStatement)
            return _.optSpace;

        return _.newline + _.indent;
    }

//Subentities generators
    function generateVerbatim($expr, flags, ctxPrecedence) {
        var verbatim = $expr[extra.verbatim],
            strVerbatim = typeof verbatim === 'string',
            precedence = !strVerbatim && verbatim.precedence !== void 0 ? verbatim.precedence : Precedence.Sequence,
            parenthesize = precedence < ctxPrecedence,
            content = strVerbatim ? verbatim : verbatim.content,
            chunks = content.split(/\r\n|\n/),
            chunkCount = chunks.length;

        if (parenthesize)
            _.js += '(';

        _.js += chunks[0];

        for (var i = 1; i < chunkCount; i++)
            _.js += _.newline + _.indent + chunks[i];

        if (parenthesize)
            _.js += ')';
    }

    function generateFunctionParams($node) {
        var $params = $node.params,
            $rest = $node.rest,
            $defaults = $node.defaults,
            paramCount = $params.length,
            lastParamIdx = paramCount - 1,
            hasDefaults = !!$defaults,
            arrowFuncWithSingleParam = $node.type === Syntax.ArrowFunctionExpression && !$rest &&
                                       (!hasDefaults || $defaults.length === 0) &&
                                       paramCount === 1 &&
                                       $params[0].type === Syntax.Identifier;

        //NOTE: arg => { } case
        if (arrowFuncWithSingleParam)
            _.js += $params[0].name;

        else {
            _.js += '(';

            for (var i = 0; i < paramCount; ++i) {
                var $param = $params[i];

                if (hasDefaults && $defaults[i]) {
                    var $fakeAssign = {
                        left: $param,
                        right: $defaults[i],
                        operator: '='
                    };

                    ExprGen.AssignmentExpression($fakeAssign, E_TTT, Precedence.Assignment);
                }

                else {
                    if ($params[i].type === Syntax.Identifier)
                        _.js += $param.name;

                    else
                        ExprGen[$param.type]($param, E_TTT, Precedence.Assignment);
                }

                if (i !== lastParamIdx)
                    _.js += ',' + _.optSpace;
            }

            if ($rest) {
                if (paramCount)
                    _.js += ',' + _.optSpace;

                _.js += '...' + $rest.name;
            }

            _.js += ')';
        }
    }

    function generateFunctionBody($node) {
        var $body = $node.body;

        generateFunctionParams($node);

        if ($node.type === Syntax.ArrowFunctionExpression)
            _.js += _.optSpace + '=>';

        if ($node.expression) {
            _.js += _.optSpace;

            var exprJs = exprToJs($body, E_TTT, Precedence.Assignment);

            if (exprJs.charAt(0) === '{')
                exprJs = '(' + exprJs + ')';

            _.js += exprJs;
        }

        else {
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, S_TTFF);
        }
    }


    function canUseRawLiteral($expr) {
        if ($expr.hasOwnProperty('raw')) {
            try {
                var raw = parse($expr.raw).body[0].expression;

                return raw.type === Syntax.Literal && raw.value === $expr.value;
            } catch (e) {
                //NOTE: not use raw property
            }
        }

        return false;
    }


//-------------------------------------------------===------------------------------------------------------
//                                           Generator flags
//-------------------------------------------------===------------------------------------------------------

//Flags
    var F_ALLOW_IN = 1,
        F_ALLOW_CALL = 1 << 1,
        F_ALLOW_UNPARATH_NEW = 1 << 2,
        F_FUNC_BODY = 1 << 3,
        F_DIRECTIVE_CTX = 1 << 4,
        F_SEMICOLON_OPT = 1 << 5;


//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
    var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TTF = F_ALLOW_IN | F_ALLOW_CALL,
        E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TFF = F_ALLOW_IN,
        E_FFT = F_ALLOW_UNPARATH_NEW,
        E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;


//Statement flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_FUNC_BODY
// F_DIRECTIVE_CTX
// F_SEMICOLON_OPT
    var S_TFFF = F_ALLOW_IN,
        S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT,
        S_FFFF = 0x00,
        S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX,
        S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

//-------------------------------------------------===-------------------------------------------------------
//                                             Expressions
//-------------------------------------------------===-------------------------------------------------------

//Regular expressions
    var FLOATING_OR_OCTAL_REGEXP = /[.eExX]|^0[0-9]+/,
        LAST_DECIMAL_DIGIT_REGEXP = /[0-9]$/;


//Common expression generators
    function generateLogicalOrBinaryExpression($expr, flags, ctxPrecedence) {
        var op = $expr.operator,
            precedence = BinaryPrecedence[$expr.operator],
            parenthesize = precedence < ctxPrecedence,
            allowIn = flags & F_ALLOW_IN || parenthesize,
            operandFlags = allowIn ? E_TTT : E_FTT,
            exprJs = exprToJs($expr.left, operandFlags, precedence);

        parenthesize |= op === 'in' && !allowIn;

        if (parenthesize)
            _.js += '(';

        // 0x2F = '/'
        if (exprJs.charCodeAt(exprJs.length - 1) === 0x2F && isIdentifierCh(op.charCodeAt(0)))
            exprJs = exprJs + _.space + op;

        else
            exprJs = join(exprJs, op);

        precedence++;

        var rightJs = exprToJs($expr.right, operandFlags, precedence);

        //NOTE: If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
        if (op === '/' && rightJs.charAt(0) === '/' || op.slice(-1) === '<' && rightJs.slice(0, 3) === '!--')
            exprJs += _.space + rightJs;

        else
            exprJs = join(exprJs, rightJs);

        _.js += exprJs;

        if (parenthesize)
            _.js += ')';
    }

    function generateArrayPatternOrExpression($expr) {
        var $elems = $expr.elements,
            elemCount = $elems.length;

        if (elemCount) {
            var lastElemIdx = elemCount - 1,
                multiline = elemCount > 1,
                prevIndent = shiftIndent(),
                itemPrefix = _.newline + _.indent;

            _.js += '[';

            for (var i = 0; i < elemCount; i++) {
                var $elem = $elems[i];

                if (multiline)
                    _.js += itemPrefix;

                if ($elem)
                    ExprGen[$elem.type]($elem, E_TTT, Precedence.Assignment);

                if (i !== lastElemIdx || !$elem)
                    _.js += ',';
            }

            _.indent = prevIndent;

            if (multiline)
                _.js += _.newline + _.indent;

            _.js += ']';
        }

        else
            _.js += '[]';
    }

    function generateImportOrExportSpecifier($expr) {
        _.js += $expr.id.name;

        if ($expr.name)
            _.js += _.space + 'as' + _.space + $expr.name.name;
    }

    function generateGeneratorOrComprehensionExpression($expr) {
        //NOTE: GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
        var $blocks = $expr.blocks,
            $filter = $expr.filter,
            isGenerator = $expr.type === Syntax.GeneratorExpression,
            exprJs = isGenerator ? '(' : '[',
            bodyJs = exprToJs($expr.body, E_TTT, Precedence.Assignment);

        if ($blocks) {
            var prevIndent = shiftIndent(),
                blockCount = $blocks.length;

            for (var i = 0; i < blockCount; ++i) {
                var blockJs = exprToJs($blocks[i], E_TTT, Precedence.Sequence);

                exprJs = i > 0 ? join(exprJs, blockJs) : (exprJs + blockJs);
            }

            _.indent = prevIndent;
        }

        if ($filter) {
            var filterJs = exprToJs($filter, E_TTT, Precedence.Sequence);

            exprJs = join(exprJs, 'if' + _.optSpace);
            exprJs = join(exprJs, '(' + filterJs + ')');
        }

        exprJs = join(exprJs, bodyJs);
        exprJs += isGenerator ? ')' : ']';

        _.js += exprJs;
    }


//Expression raw generator dictionary
    var ExprRawGen = {
        SequenceExpression: function generateSequenceExpression($expr, flags, ctxPrecedence) {
            var $children = $expr.expressions,
                childrenCount = $children.length,
                lastChildIdx = childrenCount - 1,
                parenthesize = Precedence.Sequence < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                exprFlags = allowIn ? E_TTT : E_FTT;

            if (parenthesize)
                _.js += '(';

            for (var i = 0; i < childrenCount; i++) {
                var $child = $children[i];

                ExprGen[$child.type]($child, exprFlags, Precedence.Assignment);

                if (i !== lastChildIdx)
                    _.js += ',' + _.optSpace;
            }

            if (parenthesize)
                _.js += ')';
        },

        AssignmentExpression: function generateAssignmentExpression($expr, flags, ctxPrecedence) {
            var $left = $expr.left,
                $right = $expr.right,
                parenthesize = Precedence.Assignment < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                operandFlags = allowIn ? E_TTT : E_FFT;

            if (parenthesize)
                _.js += '(';

            ExprGen[$left.type]($left, operandFlags, Precedence.Call);
            _.js += _.optSpace + $expr.operator + _.optSpace;
            ExprGen[$right.type]($right, operandFlags, Precedence.Assignment);

            if (parenthesize)
                _.js += ')';
        },

        ArrowFunctionExpression: function generateArrowFunctionExpression($expr, flags, ctxPrecedence) {
            var parenthesize = Precedence.ArrowFunction < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            generateFunctionBody($expr);

            if (parenthesize)
                _.js += ')';
        },

        ConditionalExpression: function generateConditionalExpression($expr, flags, ctxPrecedence) {
            var $test = $expr.test,
                $conseq = $expr.consequent,
                $alt = $expr.alternate,
                parenthesize = Precedence.Conditional < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                descFlags = allowIn ? E_TTT : E_FFT;

            if (parenthesize)
                _.js += '(';

            ExprGen[$test.type]($test, descFlags, Precedence.LogicalOR);
            _.js += _.optSpace + '?' + _.optSpace;
            ExprGen[$conseq.type]($conseq, descFlags, Precedence.Assignment);
            _.js += _.optSpace + ':' + _.optSpace;
            ExprGen[$alt.type]($alt, descFlags, Precedence.Assignment);

            if (parenthesize)
                _.js += ')';
        },

        LogicalExpression: generateLogicalOrBinaryExpression,

        BinaryExpression: generateLogicalOrBinaryExpression,

        CallExpression: function generateCallExpression($expr, flags, ctxPrecedence) {
            var $callee = $expr.callee,
                $args = $expr['arguments'],
                argCount = $args.length,
                lastArgIdx = argCount - 1,
                parenthesize = ~flags & F_ALLOW_CALL || Precedence.Call < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            ExprGen[$callee.type]($callee, E_TTF, Precedence.Call);
            _.js += '(';

            for (var i = 0; i < argCount; ++i) {
                var $arg = $args[i];

                ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);

                if (i !== lastArgIdx)
                    _.js += ',' + _.optSpace;
            }

            _.js += ')';

            if (parenthesize)
                _.js += ')';
        },

        NewExpression: function generateNewExpression($expr, flags, ctxPrecedence) {
            var $args = $expr['arguments'],
                parenthesize = Precedence.New < ctxPrecedence,
                argCount = $args.length,
                lastArgIdx = argCount - 1,
                withCall = ~flags & F_ALLOW_UNPARATH_NEW || parentheses || argCount > 0,
                calleeFlags = withCall ? E_TFF : E_TFT,
                calleeJs = exprToJs($expr.callee, calleeFlags, Precedence.New);

            if (parenthesize)
                _.js += '(';

            _.js += join('new', calleeJs);

            if (withCall) {
                _.js += '(';

                for (var i = 0; i < argCount; ++i) {
                    var $arg = $args[i];

                    ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);

                    if (i !== lastArgIdx)
                        _.js += ',' + _.optSpace;
                }

                _.js += ')';
            }

            if (parenthesize)
                _.js += ')';
        },

        MemberExpression: function generateMemberExpression($expr, flags, ctxPrecedence) {
            var $obj = $expr.object,
                $prop = $expr.property,
                parenthesize = Precedence.Member < ctxPrecedence,
                descFlags = flags & F_ALLOW_CALL ? E_TTF : E_TFF,
                isNumObj = !$expr.computed && $obj.type === Syntax.Literal && typeof $obj.value === 'number';

            if (parenthesize)
                _.js += '(';

            if (isNumObj) {
                //NOTE: When the following conditions are all true:
                //   1. No floating point
                //   2. Don't have exponents
                //   3. The last character is a decimal digit
                //   4. Not hexadecimal OR octal number literal
                // then we should add a floating point.

                var numJs = exprToJs($obj, descFlags, Precedence.Call),
                    withPoint = LAST_DECIMAL_DIGIT_REGEXP.test(numJs) && !FLOATING_OR_OCTAL_REGEXP.test(numJs);

                _.js += withPoint ? (numJs + '.') : numJs;
            }

            else
                ExprGen[$obj.type]($obj, descFlags, Precedence.Call);

            if ($expr.computed) {
                _.js += '[';
                ExprGen[$prop.type]($prop, descFlags, Precedence.Sequence);
                _.js += ']';
            }

            else
                _.js += '.' + $prop.name;

            if (parenthesize)
                _.js += ')';
        },

        UnaryExpression: function generateUnaryExpression($expr, flags, ctxPrecedence) {
            var parenthesize = Precedence.Unary < ctxPrecedence,
                op = $expr.operator,
                argJs = exprToJs($expr.argument, E_TTT, Precedence.Unary);

            if (parenthesize)
                _.js += '(';

            //NOTE: delete, void, typeof
            // get `typeof []`, not `typeof[]`
            if (_.optSpace === '' || op.length > 2)
                _.js += join(op, argJs);

            else {
                _.js += op;

                //NOTE: Prevent inserting spaces between operator and argument if it is unnecessary
                // like, `!cond`
                var leftCp = op.charCodeAt(op.length - 1),
                    rightCp = argJs.charCodeAt(0);

                // 0x2B = '+', 0x2D =  '-'
                if (leftCp === rightCp && (leftCp === 0x2B || leftCp === 0x2D) ||
                    isIdentifierCh(leftCp) && isIdentifierCh(rightCp)) {
                    _.js += _.space;
                }

                _.js += argJs;
            }

            if (parenthesize)
                _.js += ')';
        },

        YieldExpression: function generateYieldExpression($expr, flags, ctxPrecedence) {
            var $arg = $expr.argument,
                js = $expr.delegate ? 'yield*' : 'yield',
                parenthesize = Precedence.Yield < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            if ($arg) {
                var argJs = exprToJs($arg, E_TTT, Precedence.Assignment);

                js = join(js, argJs);
            }

            _.js += js;

            if (parenthesize)
                _.js += ')';
        },

        UpdateExpression: function generateUpdateExpression($expr, flags, ctxPrecedence) {
            var $arg = $expr.argument,
                $op = $expr.operator,
                prefix = $expr.prefix,
                precedence = prefix ? Precedence.Unary : Precedence.Postfix,
                parenthesize = precedence < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            if (prefix) {
                _.js += $op;
                ExprGen[$arg.type]($arg, E_TTT, Precedence.Postfix);

            }

            else {
                ExprGen[$arg.type]($arg, E_TTT, Precedence.Postfix);
                _.js += $op;
            }

            if (parenthesize)
                _.js += ')';
        },

        FunctionExpression: function generateFunctionExpression($expr) {
            var isGenerator = !!$expr.generator;

            _.js += isGenerator ? 'function*' : 'function';

            if ($expr.id) {
                _.js += isGenerator ? _.optSpace : _.space;
                _.js += $expr.id.name;
            }
            else
                _.js += _.optSpace;

            generateFunctionBody($expr);
        },

        ExportBatchSpecifier: function generateExportBatchSpecifier() {
            _.js += '*';
        },

        ArrayPattern: generateArrayPatternOrExpression,

        ArrayExpression: generateArrayPatternOrExpression,

        ClassExpression: function generateClassExpression($expr) {
            var $id = $expr.id,
                $super = $expr.superClass,
                $body = $expr.body,
                exprJs = 'class';

            if ($id) {
                var idJs = exprToJs($id, E_TTT);

                exprJs = join(exprJs, idJs);
            }

            if ($super) {
                var superJs = exprToJs($super, E_TTT, Precedence.Assignment);

                superJs = join('extends', superJs);
                exprJs = join(exprJs, superJs);
            }

            _.js += exprJs + _.optSpace;
            StmtGen[$body.type]($body, S_TFFT);
        },

        MethodDefinition: function generateMethodDefinition($expr) {
            var exprJs = $expr['static'] ? 'static' + _.optSpace : '',
                keyJs = exprToJs($expr.key, E_TTT, Precedence.Sequence);

            if ($expr.computed)
                keyJs = '[' + keyJs + ']';

            if ($expr.kind === 'get' || $expr.kind === 'set') {
                keyJs = join($expr.kind, keyJs);
                _.js += join(exprJs, keyJs);
            }

            else {
                if ($expr.value.generator)
                    _.js += exprJs + '*' + keyJs;

                else
                    _.js += join(exprJs, keyJs);
            }

            generateFunctionBody($expr.value);
        },

        Property: function generateProperty($expr) {
            var $val = $expr.value,
                $kind = $expr.kind,
                keyJs = exprToJs($expr.key, E_TTT, Precedence.Sequence);

            if ($expr.computed)
                keyJs = '[' + keyJs + ']';

            if ($kind === 'get' || $kind === 'set') {
                _.js += $kind + _.space + keyJs;
                generateFunctionBody($val);
            }

            else {
                if ($expr.shorthand)
                    _.js += keyJs;

                else if ($expr.method) {
                    _.js += $val.generator ? ('*' + keyJs) : keyJs;
                    generateFunctionBody($val)
                }

                else {
                    _.js += keyJs + ':' + _.optSpace;
                    ExprGen[$val.type]($val, E_TTT, Precedence.Assignment);
                }
            }
        },

        ObjectExpression: function generateObjectExpression($expr) {
            var $props = $expr.properties,
                propCount = $props.length;

            if (propCount) {
                var lastPropIdx = propCount - 1,
                    prevIndent = shiftIndent();

                _.js += '{';

                for (var i = 0; i < propCount; i++) {
                    var $prop = $props[i],
                        propType = $prop.type || Syntax.Property;

                    _.js += _.newline + _.indent;
                    ExprGen[propType]($prop, E_TTT, Precedence.Sequence);

                    if (i !== lastPropIdx)
                        _.js += ',';
                }

                _.indent = prevIndent;
                _.js += _.newline + _.indent + '}';
            }

            else
                _.js += '{}';
        },

        ObjectPattern: function generateObjectPattern($expr) {
            var $props = $expr.properties,
                propCount = $props.length;

            if (propCount) {
                var lastPropIdx = propCount - 1,
                    multiline = false;

                if (propCount === 1)
                    multiline = $props[0].value.type !== Syntax.Identifier;

                else {
                    for (var i = 0; i < propCount; i++) {
                        if (!$props[i].shorthand) {
                            multiline = true;
                            break;
                        }
                    }
                }

                _.js += multiline ? ('{' + _.newline) : '{';

                var prevIndent = shiftIndent(),
                    propSuffix = ',' + (multiline ? _.newline : _.optSpace);

                for (var i = 0; i < propCount; i++) {
                    var $prop = $props[i];

                    if (multiline)
                        _.js += _.indent;

                    ExprGen[$prop.type]($prop, E_TTT, Precedence.Sequence);

                    if (i !== lastPropIdx)
                        _.js += propSuffix;
                }

                _.indent = prevIndent;
                _.js += multiline ? (_.newline + _.indent + '}') : '}';
            }
            else
                _.js += '{}';
        },

        ThisExpression: function generateThisExpression() {
            _.js += 'this';
        },

        Identifier: function generateIdentifier($expr) {
            _.js += $expr.name;
        },

        ImportSpecifier: generateImportOrExportSpecifier,

        ExportSpecifier: generateImportOrExportSpecifier,

        Literal: function generateLiteral($expr) {
            if (parse && extra.raw && canUseRawLiteral($expr))
                _.js += $expr.raw;

            else if ($expr.value === null)
                _.js += 'null';

            else {
                var valueType = typeof $expr.value;

                if (valueType === 'string')
                    _.js += escapeString($expr.value);

                else if (valueType === 'number')
                    _.js += generateNumber($expr.value);

                else if (valueType === 'boolean')
                    _.js += $expr.value ? 'true' : 'false';

                else
                    _.js += generateRegExp($expr.value);
            }
        },

        GeneratorExpression: generateGeneratorOrComprehensionExpression,

        ComprehensionExpression: generateGeneratorOrComprehensionExpression,

        ComprehensionBlock: function generateComprehensionBlock($expr) {
            var $left = $expr.left,
                leftJs = void 0,
                rightJs = exprToJs($expr.right, E_TTT, Precedence.Sequence);

            if ($left.type === Syntax.VariableDeclaration)
                leftJs = $left.kind + _.space + stmtToJs($left.declarations[0], S_FFFF);

            else
                leftJs = exprToJs($left, E_TTT, Precedence.Call);

            leftJs = join(leftJs, $expr.of ? 'of' : 'in');

            _.js += 'for' + _.optSpace + '(' + join(leftJs, rightJs) + ')';
        },

        SpreadElement: function generateSpreadElement($expr) {
            var $arg = $expr.argument;

            _.js += '...';
            ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);
        },

        TaggedTemplateExpression: function generateTaggedTemplateExpression($expr, flags, ctxPrecedence) {
            var $tag = $expr.tag,
                $quasi = $expr.quasi,
                parenthesize = Precedence.TaggedTemplate < ctxPrecedence,
                tagFlags = flags & F_ALLOW_CALL ? E_TTF : E_TFF;

            if (parenthesize)
                _.js += '(';

            ExprGen[$tag.type]($tag, tagFlags, Precedence.Call);
            ExprGen[$quasi.type]($quasi, E_FFT, Precedence.Primary);

            if (parenthesize)
                _.js += ')';
        },

        TemplateElement: function generateTemplateElement($expr) {
            //NOTE: Don't use "cooked". Since tagged template can use raw template
            // representation. So if we do so, it breaks the script semantics.
            _.js += $expr.value.raw;
        },

        TemplateLiteral: function generateTemplateLiteral($expr) {
            var $quasis = $expr.quasis,
                $childExprs = $expr.expressions,
                quasiCount = $quasis.length,
                lastQuasiIdx = quasiCount - 1;

            _.js += '`';

            for (var i = 0; i < quasiCount; ++i) {
                var $quasi = $quasis[i];

                ExprGen[$quasi.type]($quasi, E_TTT, Precedence.Primary);

                if (i !== lastQuasiIdx) {
                    var $childExpr = $childExprs[i];

                    _.js += '${' + _.optSpace;
                    ExprGen[$childExpr.type]($childExpr, E_TTT, Precedence.Sequence);
                    _.js += _.optSpace + '}';
                }
            }

            _.js += '`';
        }
    };


//-------------------------------------------------===------------------------------------------------------
//                                              Statements
//-------------------------------------------------===------------------------------------------------------


//Regular expressions
    var EXPR_STMT_UNALLOWED_EXPR_REGEXP = /^{|^class(?:\s|{)|^function(?:\s|\*|\()/;


//Common statement generators
    function generateTryStatementHandlers(stmtJs, $finalizer, handlers) {
        var handlerCount = handlers.length,
            lastHandlerIdx = handlerCount - 1;

        for (var i = 0; i < handlerCount; ++i) {
            var handlerJs = stmtToJs(handlers[i], S_TFFF);

            stmtJs = join(stmtJs, handlerJs);

            if ($finalizer || i !== lastHandlerIdx)
                stmtJs += adoptionSuffix(handlers[i].body);
        }

        return stmtJs;
    }

    function generateForStatementIterator($op, $stmt, flags) {
        var $body = $stmt.body,
            $left = $stmt.left,
            bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
            prevIndent1 = shiftIndent(),
            stmtJs = 'for' + _.optSpace + '(';

        if ($left.type === Syntax.VariableDeclaration) {
            var prevIndent2 = shiftIndent();

            stmtJs += $left.kind + _.space + stmtToJs($left.declarations[0], S_FFFF);
            _.indent = prevIndent2;
        }

        else
            stmtJs += exprToJs($left, E_TTT, Precedence.Call);

        stmtJs = join(stmtJs, $op);

        var rightJs = exprToJs($stmt.right, E_TTT, Precedence.Sequence);

        stmtJs = join(stmtJs, rightJs) + ')';

        _.indent = prevIndent1;

        _.js += stmtJs + adoptionPrefix($body);
        StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
    }


//Statement generator dictionary
    var StmtRawGen = {
        BlockStatement: function generateBlockStatement($stmt, flags) {
            var $body = $stmt.body,
                len = $body.length,
                lastIdx = len - 1,
                itemsFlags = flags & F_FUNC_BODY ? S_TFTF : S_TFFF,
                prevIndent = shiftIndent();

            _.js += '{' + _.newline;

            for (var i = 0; i < len; i++) {
                var $item = $body[i],
                    itemFlags = itemsFlags;

                if (i === lastIdx)
                    itemFlags |= F_SEMICOLON_OPT;

                _.js += _.indent;
                StmtGen[$item.type]($item, itemFlags);
                _.js += _.newline;
            }

            _.indent = prevIndent;
            _.js += _.indent + '}';
        },

        BreakStatement: function generateBreakStatement($stmt, flags) {
            if ($stmt.label)
                _.js += 'break ' + $stmt.label.name;

            else
                _.js += 'break';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ContinueStatement: function generateContinueStatement($stmt, flags) {
            if ($stmt.label)
                _.js += 'continue ' + $stmt.label.name;

            else
                _.js += 'continue';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ClassBody: function generateClassBody($stmt) {
            var $body = $stmt.body,
                itemCount = $body.length,
                lastItemIdx = itemCount - 1,
                prevIndent = shiftIndent();

            _.js += '{' + _.newline;

            for (var i = 0; i < itemCount; i++) {
                var $item = $body[i],
                    itemType = $item.type || Syntax.Property;

                _.js += _.indent;
                ExprGen[itemType]($item, E_TTT, Precedence.Sequence);

                if (i !== lastItemIdx)
                    _.js += _.newline;
            }

            _.indent = prevIndent;
            _.js += _.newline + _.indent + '}';
        },

        ClassDeclaration: function generateClassDeclaration($stmt) {
            var $body = $stmt.body,
                $super = $stmt.superClass,
                js = 'class ' + $stmt.id.name;

            if ($super) {
                var superJs = exprToJs($super, E_TTT, Precedence.Assignment);

                js += _.space + join('extends', superJs);
            }

            _.js += js + _.optSpace;
            StmtGen[$body.type]($body, S_TFFT);
        },

        DirectiveStatement: function generateDirectiveStatement($stmt, flags) {
            if (extra.raw && $stmt.raw)
                _.js += $stmt.raw;

            else
                _.js += escapeDirective($stmt.directive);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        DoWhileStatement: function generateDoWhileStatement($stmt, flags) {
            var $body = $stmt.body,
                $test = $stmt.test,
                bodyJs = adoptionPrefix($body) +
                         stmtToJs($body, S_TFFF) +
                         adoptionSuffix($body);

            //NOTE: Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            var stmtJs = join('do', bodyJs);

            _.js += join(stmtJs, 'while' + _.optSpace + '(');
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        CatchClause: function generateCatchClause($stmt) {
            var $param = $stmt.param,
                $guard = $stmt.guard,
                $body = $stmt.body,
                prevIndent = shiftIndent();

            _.js += 'catch' + _.optSpace + '(';
            ExprGen[$param.type]($param, E_TTT, Precedence.Sequence);

            if ($guard) {
                _.js += ' if ';
                ExprGen[$guard.type]($guard, E_TTT, Precedence.Sequence);
            }

            _.indent = prevIndent;
            _.js += ')' + adoptionPrefix($body);
            StmtGen[$body.type]($body, S_TFFF);
        },

        DebuggerStatement: function generateDebuggerStatement($stmt, flags) {
            _.js += 'debugger';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        EmptyStatement: function generateEmptyStatement() {
            _.js += ';';
        },

        ExportDeclaration: function generateExportDeclaration($stmt, flags) {
            var $specs = $stmt.specifiers,
                $decl = $stmt.declaration,
                withSemicolon = semicolons || ~flags & F_SEMICOLON_OPT;

            // export default AssignmentExpression[In] ;
            if ($stmt['default']) {
                var declJs = exprToJs($decl, E_TTT, Precedence.Assignment);

                _.js += join('export default', declJs);

                if (withSemicolon)
                    _.js += ';';
            }

            // export * FromClause ;
            // export ExportClause[NoReference] FromClause ;
            // export ExportClause ;
            else if ($specs) {
                var stmtJs = 'export';

                if ($specs.length === 0)
                    stmtJs += _.optSpace + '{' + _.optSpace + '}';

                else if ($specs[0].type === Syntax.ExportBatchSpecifier) {
                    var specJs = exprToJs($specs[0], E_TTT, Precedence.Sequence);

                    stmtJs = join(stmtJs, specJs);
                }

                else {
                    var prevIndent = shiftIndent(),
                        specCount = $specs.length,
                        lastSpecIdx = specCount - 1;

                    stmtJs += _.optSpace + '{';

                    for (var i = 0; i < specCount; ++i) {
                        stmtJs += _.newline + _.indent;
                        stmtJs += exprToJs($specs[i], E_TTT, Precedence.Sequence);

                        if (i !== lastSpecIdx)
                            stmtJs += ',';
                    }

                    _.indent = prevIndent;
                    stmtJs += _.newline + _.indent + '}';
                }

                if ($stmt.source) {
                    _.js += join(stmtJs, 'from' + _.optSpace);
                    ExprGen.Literal($stmt.source);
                }

                else
                    _.js += stmtJs;

                if (withSemicolon)
                    _.js += ';';
            }

            // export VariableStatement
            // export Declaration[Default]
            else if ($decl) {
                var declJs = stmtToJs($decl, withSemicolon ? S_TFFF : S_TFFT);

                _.js += join('export', declJs);
            }
        },

        ExpressionStatement: function generateExpressionStatement($stmt, flags) {
            var $expr = $stmt.expression,
                exprJs = exprToJs($expr, E_TTT, Precedence.Sequence),
                parenthesize = EXPR_STMT_UNALLOWED_EXPR_REGEXP.test(exprJs) ||
                               (directive &&
                                flags & F_DIRECTIVE_CTX &&
                                $expr.type === Syntax.Literal &&
                                typeof $expr.value === 'string');

            //NOTE: '{', 'function', 'class' are not allowed in expression statement.
            // Therefore, they should be parenthesized.
            if (parenthesize)
                _.js += '(' + exprJs + ')';

            else
                _.js += exprJs;

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ImportDeclaration: function generateImportDeclaration($stmt, flags) {
            var $specs = $stmt.specifiers,
                stmtJs = 'import',
                specCount = $specs.length;

            //NOTE: If no ImportClause is present,
            // this should be `import ModuleSpecifier` so skip `from`
            // ModuleSpecifier is StringLiteral.
            if (specCount) {
                var hasBinding = !!$specs[0]['default'],
                    firstNamedIdx = hasBinding ? 1 : 0,
                    lastSpecIdx = specCount - 1;

                // ImportedBinding
                if (hasBinding)
                    stmtJs = join(stmtJs, $specs[0].id.name);

                // NamedImports
                if (firstNamedIdx < specCount) {
                    if (hasBinding)
                        stmtJs += ',';

                    stmtJs += _.optSpace + '{';

                    // import { ... } from "...";
                    if (firstNamedIdx === lastSpecIdx)
                        stmtJs += _.optSpace + exprToJs($specs[firstNamedIdx], E_TTT, Precedence.Sequence) + _.optSpace;

                    else {
                        var prevIndent = shiftIndent();

                        // import {
                        //    ...,
                        //    ...,
                        // } from "...";
                        for (var i = firstNamedIdx; i < specCount; i++) {
                            stmtJs += _.newline + _.indent + exprToJs($specs[i], E_TTT, Precedence.Sequence);

                            if (i !== lastSpecIdx)
                                stmtJs += ',';
                        }

                        _.indent = prevIndent;
                        stmtJs += _.newline + _.indent;
                    }

                    stmtJs += '}' + _.optSpace;
                }

                stmtJs = join(stmtJs, 'from')
            }

            _.js += stmtJs + _.optSpace;
            ExprGen.Literal($stmt.source);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        VariableDeclarator: function generateVariableDeclarator($stmt, flags) {
            var $id = $stmt.id,
                $init = $stmt.init,
                descFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;

            if ($init) {
                ExprGen[$id.type]($id, descFlags, Precedence.Assignment);
                _.js += _.optSpace + '=' + _.optSpace;
                ExprGen[$init.type]($init, descFlags, Precedence.Assignment);
            }

            else {
                if ($id.type === Syntax.Identifier)
                    _.js += $id.name;

                else
                    ExprGen[$id.type]($id, descFlags, Precedence.Assignment);
            }
        },

        VariableDeclaration: function generateVariableDeclaration($stmt, flags) {
            var $decls = $stmt.declarations,
                len = $decls.length,
                prevIndent = len > 1 ? shiftIndent() : _.indent,
                declFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;

            _.js += $stmt.kind;

            for (var i = 0; i < len; i++) {
                var $decl = $decls[i];

                _.js += i === 0 ? _.space : (',' + _.optSpace);
                StmtGen[$decl.type]($decl, declFlags);
            }

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';

            _.indent = prevIndent;
        },

        ThrowStatement: function generateThrowStatement($stmt, flags) {
            var argJs = exprToJs($stmt.argument, E_TTT, Precedence.Sequence);

            _.js += join('throw', argJs);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        TryStatement: function generateTryStatement($stmt) {
            var $block = $stmt.block,
                $finalizer = $stmt.finalizer,
                stmtJs = 'try' +
                         adoptionPrefix($block) +
                         stmtToJs($block, S_TFFF) +
                         adoptionSuffix($block);

            var $handlers = $stmt.handlers || $stmt.guardedHandlers;

            if ($handlers)
                stmtJs = generateTryStatementHandlers(stmtJs, $finalizer, $handlers);

            if ($stmt.handler) {
                $handlers = isArray($stmt.handler) ? $stmt.handler : [$stmt.handler];
                stmtJs = generateTryStatementHandlers(stmtJs, $finalizer, $handlers);
            }

            if ($finalizer) {
                stmtJs = join(stmtJs, 'finally' + adoptionPrefix($finalizer));
                stmtJs += stmtToJs($finalizer, S_TFFF);
            }

            _.js += stmtJs;
        },

        SwitchStatement: function generateSwitchStatement($stmt) {
            var $cases = $stmt.cases,
                $discr = $stmt.discriminant,
                prevIndent = shiftIndent();

            _.js += 'switch' + _.optSpace + '(';
            ExprGen[$discr.type]($discr, E_TTT, Precedence.Sequence);
            _.js += ')' + _.optSpace + '{' + _.newline;
            _.indent = prevIndent;

            if ($cases) {
                var caseCount = $cases.length,
                    lastCaseIdx = caseCount - 1;

                for (var i = 0; i < caseCount; i++) {
                    var $case = $cases[i];

                    _.js += _.indent;
                    StmtGen[$case.type]($case, i === lastCaseIdx ? S_TFFT : S_TFFF);
                    _.js += _.newline;
                }
            }

            _.js += _.indent + '}';
        },

        SwitchCase: function generateSwitchCase($stmt, flags) {
            var $conseqs = $stmt.consequent,
                $firstConseq = $conseqs[0],
                $test = $stmt.test,
                i = 0,
                conseqSemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                conseqCount = $conseqs.length,
                lastConseqIdx = conseqCount - 1,
                prevIndent = shiftIndent();

            if ($test) {
                var testJs = exprToJs($test, E_TTT, Precedence.Sequence);

                _.js += join('case', testJs) + ':';
            }

            else
                _.js += 'default:';


            if (conseqCount && $firstConseq.type === Syntax.BlockStatement) {
                i++;
                _.js += adoptionPrefix($firstConseq);
                StmtGen[$firstConseq.type]($firstConseq, S_TFFF);
            }

            for (; i < conseqCount; i++) {
                var $conseq = $conseqs[i],
                    semicolonOptional = i === lastConseqIdx && conseqSemicolonOptional;

                _.js += _.newline + _.indent;
                StmtGen[$conseq.type]($conseq, semicolonOptional ? S_TFFT : S_TFFF);
            }

            _.indent = prevIndent;
        },

        IfStatement: function generateIfStatement($stmt, flags) {
            var $alt = $stmt.alternate,
                $conseq = $stmt.consequent,
                $test = $stmt.test,
                prevIndent = shiftIndent(),
                semicolonOptional = !semicolons && flags & F_SEMICOLON_OPT;

            _.js += 'if' + _.optSpace + '(';
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($conseq);

            if ($alt) {
                var conseq = stmtToJs($conseq, S_TFFF) + adoptionSuffix($conseq),
                    alt = stmtToJs($alt, semicolonOptional ? S_TFFT : S_TFFF);

                if ($alt.type === Syntax.IfStatement)
                    alt = 'else ' + alt;

                else
                    alt = join('else', adoptionPrefix($alt) + alt);

                _.js += join(conseq, alt);
            }

            else
                StmtGen[$conseq.type]($conseq, semicolonOptional ? S_TFFT : S_TFFF);
        },

        ForStatement: function generateForStatement($stmt, flags) {
            var $init = $stmt.init,
                $test = $stmt.test,
                $body = $stmt.body,
                $update = $stmt.update,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'for' + _.optSpace + '(';

            if ($init) {
                if ($init.type === Syntax.VariableDeclaration)
                    StmtGen[$init.type]($init, S_FFFF);

                else {
                    ExprGen[$init.type]($init, E_FTT, Precedence.Sequence);
                    _.js += ';';
                }
            }

            else
                _.js += ';';

            if ($test) {
                _.js += _.optSpace;
                ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            }

            _.js += ';';

            if ($update) {
                _.js += _.optSpace;
                ExprGen[$update.type]($update, E_TTT, Precedence.Sequence);
            }

            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        },

        ForInStatement: function generateForInStatement($stmt, flags) {
            generateForStatementIterator('in', $stmt, flags);
        },

        ForOfStatement: function generateForOfStatement($stmt, flags) {
            generateForStatementIterator('of', $stmt, flags);
        },

        LabeledStatement: function generateLabeledStatement($stmt, flags) {
            var $body = $stmt.body,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = _.indent;

            _.js += $stmt.label.name + ':' + adoptionPrefix($body);

            if ($body.type !== Syntax.BlockStatement)
                prevIndent = shiftIndent();

            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
            _.indent = prevIndent;
        },

        ModuleDeclaration: function generateModuleDeclaration($stmt, flags) {
            _.js += 'module' + _.space + $stmt.id.name + _.space + 'from' + _.optSpace;

            ExprGen.Literal($stmt.source);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        Program: function generateProgram($stmt) {
            var $body = $stmt.body,
                len = $body.length,
                lastIdx = len - 1;

            if (safeConcatenation && len > 0)
                _.js += '\n';

            for (var i = 0; i < len; i++) {
                var $item = $body[i],
                    itemFlags = S_TFTF;

                if (!safeConcatenation && i === lastIdx)
                    itemFlags |= F_SEMICOLON_OPT;

                _.js += _.indent;
                StmtGen[$item.type]($item, itemFlags);

                if (i !== lastIdx)
                    _.js += _.newline;
            }
        },

        FunctionDeclaration: function generateFunctionDeclaration($stmt) {
            var isGenerator = !!$stmt.generator;

            _.js += isGenerator ? ('function*' + _.optSpace) : ('function' + _.space );
            _.js += $stmt.id.name;
            generateFunctionBody($stmt);
        },

        ReturnStatement: function generateReturnStatement($stmt, flags) {
            var $arg = $stmt.argument;

            if ($arg) {
                var argJs = exprToJs($arg, E_TTT, Precedence.Sequence);

                _.js += join('return', argJs);
            }

            else
                _.js += 'return';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        WhileStatement: function generateWhileStatement($stmt, flags) {
            var $body = $stmt.body,
                $test = $stmt.test,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'while' + _.optSpace + '(';
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;

            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        },

        WithStatement: function generateWithStatement($stmt, flags) {
            var $body = $stmt.body,
                $obj = $stmt.object,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'with' + _.optSpace + '(';
            ExprGen[$obj.type]($obj, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        }
    };

    function generateStatement($stmt, option) {
        StmtGen[$stmt.type]($stmt, option);
    }

//CodeGen
//-----------------------------------------------------------------------------------
    function exprToJs($expr, flags, ctxPrecedence) {
        var savedJs = _.js;
        _.js = '';

        ExprGen[$expr.type]($expr, flags, ctxPrecedence);

        var src = _.js;
        _.js = savedJs;

        return src;
    }

    function stmtToJs($stmt, flags) {
        var savedJs = _.js;
        _.js = '';

        StmtGen[$stmt.type]($stmt, flags);

        var src = _.js;
        _.js = savedJs;

        return src;
    }

    function run($node) {
        _.js = '';

        if (StmtGen[$node.type])
            StmtGen[$node.type]($node, S_TFFF);

        else
            ExprGen[$node.type]($node, E_TTF, Precedence.Sequence);

        return _.js;
    }

    function wrapExprGen(gen) {
        return function ($expr, flags, ctxPrecedence) {
            if (extra.verbatim && $expr.hasOwnProperty(extra.verbatim))
                generateVerbatim($expr, flags, ctxPrecedence);

            else
                gen($expr, flags);
        }
    }

    function createExprGenWithExtras() {
        var gens = {};

        for (var key in ExprRawGen) {
            if (ExprRawGen.hasOwnProperty(key))
                gens[key] = wrapExprGen(ExprRawGen[key]);
        }

        return gens;
    }


//Strings
    var _ = {
        js: '',
        newline: '\n',
        optSpace: ' ',
        space: ' ',
        indentUnit: '    ',
        indent: ''
    };


//Generators
    var ExprGen = void 0,
        StmtGen = StmtRawGen;


    function generate($node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            //NOTE: Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            _.indentUnit = options.format.indent.style;
            if (typeof options.base === 'string') {
                _.indent = options.base;
            } else {
                _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            _.indentUnit = options.format.indent.style;
            _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;

        _.newline = options.format.newline;
        _.optSpace = options.format.space;

        if (options.format.compact)
            _.newline = _.optSpace = _.indentUnit = _.indent = '';

        _.space = _.optSpace ? _.optSpace : ' ';
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        extra = options;

        if (extra.verbatim)
            ExprGen = createExprGenWithExtras();

        else
            ExprGen = ExprRawGen;

        return run($node);
    }

    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };

    var esotope = {
        generate: generate,
        Precedence: updateDeeply({}, Precedence),
        browser: false,
        FORMAT_MINIFY: FORMAT_MINIFY,
        FORMAT_DEFAULTS: getDefaultOptions().format
    };

    //Node
    if (typeof module !== 'undefined' && module.exports)
        module.exports = esotope;

    //RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        esotope.browser = true;

        define([], function () {
            return esotope;
        });
    }

    else {
        esotope.browser = true;
        global.esotope = esotope;
    }

})(this);

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$3.checkParams = function(node, allowDuplicates) {
    var nameHash = {};
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLVal(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types.comma)
        { elt = null; }
      else if (this.type === types.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$3.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$3.parseIdent = function(liberal, isBinding) {
    var node = this.startNode();
    if (this.type === types.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
          (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
    } else {
      this.unexpected();
    }
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  // Parses yield expression inside generator.

  pp$3.parseYield = function(noIn) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types.semi || this.canInsertSemicolon() || (this.type !== types.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types.star);
      node.argument = this.parseMaybeAssign(noIn);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$3.parseAwait = function() {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, false);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$5 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$5.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$5.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$5.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$5.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$5.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$5.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$5.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$5.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$6 = Parser.prototype;

  pp$6.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$6.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$6.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$6.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  // The algorithm used to determine whether a regexp can appear at a

  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types$1 = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$7 = Parser.prototype;

  pp$7.initialContext = function() {
    return [types$1.b_stat]
  };

  pp$7.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types$1.f_expr || parent === types$1.f_stat)
      { return true }
    if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types._return || prevType === types.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType === types.arrow)
      { return true }
    if (prevType === types.braceL)
      { return parent === types$1.b_stat }
    if (prevType === types._var || prevType === types._const || prevType === types.name)
      { return false }
    return !this.exprAllowed
  };

  pp$7.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$7.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Token-specific context update code

  types.parenR.updateContext = types.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types$1.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
    this.exprAllowed = true;
  };

  types.dollarBraceL.updateContext = function() {
    this.context.push(types$1.b_tmpl);
    this.exprAllowed = true;
  };

  types.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
    this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
    this.exprAllowed = true;
  };

  types.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types._function.updateContext = types._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
        !(prevType === types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
      { this.context.push(types$1.f_expr); }
    else
      { this.context.push(types$1.f_stat); }
    this.exprAllowed = false;
  };

  types.backQuote.updateContext = function() {
    if (this.curContext() === types$1.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types$1.q_tmpl); }
    this.exprAllowed = false;
  };

  types.star.updateContext = function(prevType) {
    if (prevType === types._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types$1.f_expr)
        { this.context[index] = types$1.f_expr_gen; }
      else
        { this.context[index] = types$1.f_gen; }
    }
    this.exprAllowed = true;
  };

  types.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // This file contains Unicode properties extracted from the ECMAScript
  // specification. The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }
  buildUnicodeData(9);
  buildUnicodeData(10);
  buildUnicodeData(11);

  var pp$8 = Parser.prototype;

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 11 ? 11 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = [];
    this.backReferenceNames = [];
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    var next = s.charCodeAt(i + 1);
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.pos, forceU)
  };

  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.nextIndex(this.pos, forceU), forceU)
  };

  RegExpValidationState.prototype.advance = function advance (forceU) {
      if ( forceU === void 0 ) forceU = false;

    this.pos = this.nextIndex(this.pos, forceU);
  };

  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
      if ( forceU === void 0 ) forceU = false;

    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true
    }
    return false
  };

  function codePointToString(ch) {
    if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
    ch -= 0x10000;
    return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
  }

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$8.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
    }
  };

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$8.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$8.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames.length = 0;
    state.backReferenceNames.length = 0;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (state.groupNames.indexOf(name) === -1) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$8.regexp_disjunction = function(state) {
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      this.regexp_alternative(state);
    }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$8.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state))
      { }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$8.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$8.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$8.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$8.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$8.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$8.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$8.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
        this.regexp_disjunction(state);
        if (state.eat(0x29 /* ) */)) {
          return true
        }
        state.raise("Unterminated group");
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$8.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$8.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$8.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$8.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$8.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier ::
  //   [empty]
  //   `?` GroupName
  pp$8.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (this.regexp_eatGroupName(state)) {
        if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
          state.raise("Duplicate capture group name");
        }
        state.groupNames.push(state.lastStringValue);
        return
      }
      state.raise("Invalid group");
    }
  };

  // GroupName ::
  //   `<` RegExpIdentifierName `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$8.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName ::
  //   RegExpIdentifierStart
  //   RegExpIdentifierName RegExpIdentifierPart
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$8.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  pp$8.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$8.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$8.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$8.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$8.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$8.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$8.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$8.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$8.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$8.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if ( forceU === void 0 ) forceU = false;

    var start = state.pos;
    var switchU = forceU || state.switchU;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$8.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$8.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$8.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return true
    }

    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      (ch === 0x50 /* P */ || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      if (
        state.eat(0x7B /* { */) &&
        this.regexp_eatUnicodePropertyValueExpression(state) &&
        state.eat(0x7D /* } */)
      ) {
        return true
      }
      state.raise("Invalid property name");
    }

    return false
  };
  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$8.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return true
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
      return true
    }
    return false
  };
  pp$8.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!has(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };
  pp$8.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (!state.unicodeProperties.binary.test(nameOrValue))
      { state.raise("Invalid property name"); }
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$8.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$8.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$8.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$8.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      state.eat(0x5E /* ^ */);
      this.regexp_classRanges(state);
      if (state.eat(0x5D /* ] */)) {
        return true
      }
      // Unreachable since it threw "unterminated regular expression" error before.
      state.raise("Unterminated character class");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$8.regexp_classRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$8.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* ] */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$8.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$8.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$8.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$8.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$8.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$8.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$8.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$8.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp$9 = Parser.prototype;

  // Move to the next token

  pp$9.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp$9.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp$9[Symbol.iterator] = function() {
      var this$1 = this;

      return {
        next: function () {
          var token = this$1.getToken();
          return {
            done: token.type === types.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  pp$9.curContext = function() {
    return this.context[this.context.length - 1]
  };

  // Read a single token, updating the parser object's token-related
  // properties.

  pp$9.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp$9.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp$9.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xe000) { return code }
    var next = this.input.charCodeAt(this.pos + 1);
    return (code << 10) + next - 0x35fdc00
  };

  pp$9.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      lineBreakG.lastIndex = start;
      var match;
      while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
        ++this.curLine;
        this.lineStart = match.index + match[0].length;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp$9.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp$9.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp$9.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp$9.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types.dot)
    }
  };

  pp$9.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.slash, 1)
  };

  pp$9.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types.star : types.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp$9.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
  };

  pp$9.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.bitwiseXOR, 1)
  };

  pp$9.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types.assign, 2) }
    return this.finishOp(types.plusMin, 1)
  };

  pp$9.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
      return this.finishOp(types.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types.relational, size)
  };

  pp$9.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types.arrow)
    }
    return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
  };

  pp$9.readToken_question = function() { // '?'
    if (this.options.ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 63) { return this.finishOp(types.coalesce, 2) }
    }
    return this.finishOp(types.question, 1)
  };

  pp$9.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types.parenL)
    case 41: ++this.pos; return this.finishToken(types.parenR)
    case 59: ++this.pos; return this.finishToken(types.semi)
    case 44: ++this.pos; return this.finishToken(types.comma)
    case 91: ++this.pos; return this.finishToken(types.bracketL)
    case 93: ++this.pos; return this.finishToken(types.bracketR)
    case 123: ++this.pos; return this.finishToken(types.braceL)
    case 125: ++this.pos; return this.finishToken(types.braceR)
    case 58: ++this.pos; return this.finishToken(types.colon)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 63: // '?'
      return this.readToken_question()

    case 126: // '~'
      return this.finishOp(types.prefix, 1)
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString$1(code) + "'");
  };

  pp$9.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp$9.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp$9.readInt = function(radix, len) {
    var start = this.pos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);
      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      ++this.pos;
      total = total * radix + val;
    }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  pp$9.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = typeof BigInt !== "undefined" ? BigInt(this.input.slice(start, this.pos)) : null;
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp$9.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var str$1 = this.input.slice(start, this.pos);
      var val$1 = typeof BigInt !== "undefined" ? BigInt(str$1) : null;
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types.num, val$1)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var str = this.input.slice(start, this.pos);
    var val = octal ? parseInt(str, 8) : parseFloat(str);
    return this.finishToken(types.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp$9.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  function codePointToString$1(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  pp$9.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else {
        if (isNewLine(ch, this.options.ecmaVersion >= 10)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp$9.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp$9.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp$9.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types.template || this.type === types.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp$9.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break
        }
      // falls through

      case "`":
        return this.finishToken(types.invalidTemplate, this.input.slice(this.start, this.pos))

      // no default
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp$9.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString$1(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    case 56:
    case 57:
      if (inTemplate) {
        var codePos = this.pos - 1;

        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );

        return null
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp$9.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp$9.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString$1(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp$9.readWord = function() {
    var word = this.readWord1();
    var type = types.name;
    if (this.keywords.test(word)) {
      type = keywords$1[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.

  var version = "7.1.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types,
    keywordTypes: keywords$1,
    TokContext: TokContext,
    tokContexts: types$1,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api].
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  function parse(input, options) {
    return Parser.parse(input, options)
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
  }

  exports.Node = Node;
  exports.Parser = Parser;
  exports.Position = Position;
  exports.SourceLocation = SourceLocation;
  exports.TokContext = TokContext;
  exports.Token = Token;
  exports.TokenType = TokenType;
  exports.defaultOptions = defaultOptions;
  exports.getLineInfo = getLineInfo;
  exports.isIdentifierChar = isIdentifierChar;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isNewLine = isNewLine;
  exports.keywordTypes = keywords$1;
  exports.lineBreak = lineBreak;
  exports.lineBreakG = lineBreakG;
  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokContexts = types$1;
  exports.tokTypes = types;
  exports.tokenizer = tokenizer;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.Constants !== 'undefined') {
        return;
    }
    var Constants = sandbox.Constants = {};

    Constants.isBrowser = !(typeof exports !== 'undefined' && this.exports !== exports);

    var APPLY = Constants.APPLY = Function.prototype.apply;
    var CALL = Constants.CALL = Function.prototype.call;
    APPLY.apply = APPLY;
    APPLY.call = CALL;
    CALL.apply = APPLY;
    CALL.call = CALL;

    var HAS_OWN_PROPERTY = Constants.HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
    Constants.HAS_OWN_PROPERTY_CALL = Object.prototype.hasOwnProperty.call;


    var PREFIX1 = Constants.JALANGI_VAR = "J$";
    Constants.SPECIAL_PROP = "*" + PREFIX1 + "*";
    Constants.SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
    Constants.SPECIAL_PROP3 = "*" + PREFIX1 + "C*";
    Constants.SPECIAL_PROP4 = "*" + PREFIX1 + "W*";
    Constants.SPECIAL_PROP_SID = "*" + PREFIX1 + "SID*";
    Constants.SPECIAL_PROP_IID = "*" + PREFIX1 + "IID*";

    Constants.UNKNOWN = -1;

    //-------------------------------- End constants ---------------------------------

    //-------------------------------------- Constant functions -----------------------------------------------------------

    var HOP = Constants.HOP = function (obj, prop) {
        return (prop + "" === '__proto__') || CALL.call(HAS_OWN_PROPERTY, obj, prop); //Constants.HAS_OWN_PROPERTY_CALL.apply(Constants.HAS_OWN_PROPERTY, [obj, prop]);
    };

    Constants.hasGetterSetter = function (obj, prop, isGetter) {
        if (typeof Object.getOwnPropertyDescriptor !== 'function') {
            return true;
        }
        while (obj !== null) {
            if (typeof obj !== 'object' && typeof obj !== 'function') {
                return false;
            }
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            if (desc !== undefined) {
                if (isGetter && typeof desc.get === 'function') {
                    return true;
                }
                if (!isGetter && typeof desc.set === 'function') {
                    return true;
                }
            } else if (HOP(obj, prop)) {
                return false;
            }
            obj = obj.__proto__;
        }
        return false;
    };

    Constants.debugPrint = function (s) {
        if (sandbox.Config.DEBUG) {
            console.log("***" + s);
        }
    };

    Constants.warnPrint = function (iid, s) {
        if (sandbox.Config.WARN && iid !== 0) {
            console.log("        at " + iid + " " + s);
        }
    };

    Constants.seriousWarnPrint = function (iid, s) {
        if (sandbox.Config.SERIOUS_WARN && iid !== 0) {
            console.log("        at " + iid + " Serious " + s);
        }
    };

})(J$);


/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.Config !== 'undefined') {
        return;
    }

    var Config = sandbox.Config = {};

    Config.DEBUG = false;
    Config.WARN = false;
    Config.SERIOUS_WARN = false;
// make MAX_BUF_SIZE slightly less than 2^16, to allow over low-level overheads
    Config.MAX_BUF_SIZE = 64000;
    Config.LOG_ALL_READS_AND_BRANCHES = false;

    //**********************************************************
    //  Functions for selective instrumentation of operations
    //**********************************************************
    // In the following functions
    // return true in a function, if you want the ast node (passed as the second argument) to be instrumented
    // ast node gets instrumented if you do not define the corresponding function
    Config.ENABLE_SAMPLING = false;
//    Config.INSTR_INIT = function(name, ast) { return false; };
//    Config.INSTR_READ = function(name, ast) { return false; };
//    Config.INSTR_WRITE = function(name, ast) { return true; };
//    Config.INSTR_GETFIELD = function(offset, ast) { return true; }; // offset is null if the property is computed
//    Config.INSTR_PUTFIELD = function(offset, ast) { return true; }; // offset is null if the property is computed
//    Config.INSTR_BINARY = function(operator, ast) { return true; };
//    Config.INSTR_PROPERTY_BINARY_ASSIGNMENT = function(operator, offset, ast) { return true; }; // a.x += e or a[e1] += e2
//    Config.INSTR_UNARY = function(operator, ast) { return true; };
//    Config.INSTR_LITERAL = function(literal, ast) { return true;}; // literal gets some dummy value if the type is object, function, or array
//    Config.INSTR_CONDITIONAL = function(type, ast) { return true; }; // type could be "&&", "||", "switch", "other"
//    Config.INSTR_TRY_CATCH_ARGUMENTS = function(ast) {return false; }; // wrap function and script bodies with try catch block and use arguments in J$.Fe.  DO NOT USE THIS.
//    Config.INSTR_END_EXPRESSION = function(ast) {return true; }; // top-level expression marker
}(J$));

/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen
// Author: Manu Sridharan

/*jslint node: true */
/*global window */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    var astUtil = sandbox.astUtil;
    if (typeof astUtil !== 'undefined') {
        return;
    } else {
        astUtil = sandbox.astUtil = {};
    }

    var Constants = sandbox.Constants;
    var HOP = Constants.HOP;
    var JALANGI_VAR = Constants.JALANGI_VAR;

    /**
     * information on surrounding AST context, to be used by visitors passed
     * to transformAst()
     */
    var CONTEXT = {
        // TODO what is this?
        RHS:1,
        // TODO what is this?
        IGNORE:2,
        // inside the properties of an ObjectExpression
        OEXP:3,
        // inside the formal parameters of a FunctionDeclaration or FunctionExpression
        PARAMS:4,
        // TODO what is this?
        OEXP2:5,
        // inside a getter
        GETTER:6,
        // inside a setter
        SETTER:7,

        TYPEOF:8
    };

    /**
     * invoked by transformAst() to see if a sub-ast should be ignored.  For now,
     * only ignoring calls to J$.I()
     */
    function ignoreSubAst(node) {
        return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' && node.callee.object.name === JALANGI_VAR &&
            node.callee.property.type === 'Identifier' && node.callee.property.name === 'I';
    }

    /**
     * generic AST visitor that allows for AST transformation.
     *
     * @param object the root AST node to be visited
     * @param visitorPost an object defining visitor methods to be executed after a node's children
     * have been visited.  The properties of visitorPost should be named with AST node types, and the
     * property values should be functions that take the node to be visited and a context value (see
     * the CONTEXT object above).  E.g., a post-visitor could be:
     * { 'AssignmentExpression': function (node, context) {
     *      // node.type === 'AssignmentExpression'
     *   }
     * }
     * The value returned by the visitorPost method for a node will replace the node in the AST.
     * @param visitorPre an object defining visitor methods to be executed before a node's children
     * have been visited.  Structure should be similar to visitorPost (see above).  The return value
     * of visitorPre functions is ignored.
     * @param context the context of the surrounding AST; see the CONTEXT object above
     * @param {boolean?} noIgnore if true, no sub-ast will be ignored.  Otherwise, sub-ASTs will be ignored
     * if ignoreAST() returns true.
     */
    function transformAst(object, visitorPost, visitorPre, context, noIgnore) {
        var key, child, type, ret, newContext;

        type = object.type;
        if (visitorPre && HOP(visitorPre, type)) {
            visitorPre[type](object, context);
        }

        for (key in object) {
//            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null && key !== "scope" && (noIgnore || !ignoreSubAst(object))) {
                    if ((type === 'AssignmentExpression' && key === 'left') ||
                        (type === 'UpdateExpression' && key === 'argument') ||
                        (type === 'UnaryExpression' && key === 'argument' && object.operator === 'delete') ||
                        (type === 'ForInStatement' && key === 'left') ||
                        ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'id') ||
                        (type === 'LabeledStatement' && key === 'label') ||
                        (type === 'BreakStatement' && key === 'label') ||
                        (type === 'CatchClause' && key === 'param') ||
                        (type === 'ContinueStatement' && key === 'label') ||
                        ((type === 'CallExpression' || type === 'NewExpression') &&
                            key === 'callee' &&
                            (object.callee.type === 'MemberExpression' ||
                                (object.callee.type === 'Identifier' && object.callee.name === 'eval'))) ||
                        (type === 'VariableDeclarator' && key === 'id') ||
                        (type === 'MemberExpression' && !object.computed && key === 'property')) {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'ObjectExpression' && key === 'properties') {
                        newContext = CONTEXT.OEXP;
                    } else if ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'params') {
                        newContext = CONTEXT.PARAMS;
                    } else if (context === CONTEXT.OEXP) {
                        newContext = CONTEXT.OEXP2;
                    } else if (context === CONTEXT.OEXP2 && key === 'key') {
                        newContext = CONTEXT.IGNORE;
                    } else if (context === CONTEXT.PARAMS) {
                        newContext = CONTEXT.IGNORE;
                    } else if (object.key && key === 'value' && object.kind === 'get') {
                        newContext = CONTEXT.GETTER;
                    } else if (object.key && key === 'value' && object.kind === 'set') {
                        newContext = CONTEXT.SETTER;
                    } else if (type === 'CallExpression' && key === 'callee' && child.type === 'Identifier' && child.name === 'eval') {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'UnaryExpression' && key === 'argument' && object.operator === 'typeof' && child.type === 'Identifier') {
                        newContext = CONTEXT.TYPEOF;
                    } else {
                            newContext = CONTEXT.RHS;
                    }
                    if (key !== 'bodyOrig') {
                        object[key] = transformAst(child, visitorPost, visitorPre, newContext, noIgnore);
                    }
                }
//            }
        }

        if (visitorPost && HOP(visitorPost, type)) {
            ret = visitorPost[type](object, context);
        } else {
            ret = object;
        }
        return ret;

    }

    /**
     * computes a map from iids to the corresponding AST nodes for root.  The root AST is destructively updated to
     * include SymbolicReference nodes that reference other nodes by iid, in order to save space in the map.
     */
    function serialize(root) {
        // Stores a pointer to the most-recently encountered node representing a function or a
        // top-level script.  We need this stored pointer since a function expression or declaration
        // has no associated IID, but we'd like to have the ASTs as entries in the table.  Instead,
        // we associate the AST with the IID for the corresponding function-enter or script-enter IID.
        // We don't need a stack here since we only use this pointer at the next function-enter or script-enter,
        // and there cannot be a nested function declaration in-between.
        var parentFunOrScript = root;
        var iidToAstTable = {};

        function handleFun(node) {
            parentFunOrScript = node;
        }

        var visitorPre = {
            'Program':handleFun,
            'FunctionDeclaration':handleFun,
            'FunctionExpression':handleFun
        };

        function canMakeSymbolic(node) {
            if (node.callee.object) {
                var callee = node.callee;
                // we can replace calls to J$ functions with a SymbolicReference iff they have an IID as their first
                // argument.  'instrumentCode', 'getConcrete', and 'I' do not take an IID.
                // TODO are we missing other cases?
                if (callee.object.name === 'J$' && callee.property.name !== "instrumentCode" &&
                    callee.property.name !== "getConcrete" &&
                    callee.property.name !== "I" && node.arguments[0]) {
                    return true;
                }
            }
            return false;
        }

        function setSerializedAST(iid, ast) {
            var entry = iidToAstTable[iid];
            if (!entry) {
                entry = {};
                iidToAstTable[iid] = entry;
            }
            entry.serializedAST = ast;
        }
        var visitorPost = {
            'CallExpression':function (node) {
                try {
                    if (node.callee.object && node.callee.object.name === 'J$' && (node.callee.property.name === 'Se' || node.callee.property.name === 'Fe')) {
                        // associate IID with the AST of the containing function / script
                        setSerializedAST(node.arguments[0].value, parentFunOrScript);
                        return node;
                    } else if (canMakeSymbolic(node)) {
                        setSerializedAST(node.arguments[0].value, node);
                        return {type:"SymbolicReference", value:node.arguments[0].value};
                    }
                    return node;
                } catch (e) {
                    console.log(JSON.stringify(node));
                    throw e;
                }
            }
        };

        transformAst(root, visitorPost, visitorPre);
        return iidToAstTable;
    }

    /**
     * given an iidToAstTable constructed by the serialize() function, destructively
     * update the AST values to remove SymbolicReference nodes, replacing them with a
     * pointer to the appropriate actual AST node.
     */
    function deserialize(iidToAstTable) {
        Object.keys(iidToAstTable).forEach(function (iid) {
            var curAst = iidToAstTable[iid].serializedAST;
            if (curAst) {
                var visitorPost = {
                    'SymbolicReference': function (node) {
                        var targetAST = iidToAstTable[node.value].serializedAST;
                        if (!targetAST) {
                            throw "bad symbolic reference";
                        }
                        return targetAST;
                    }
                };
                transformAst(curAst, visitorPost);
            }
        });
    }

    /**
     * given an instrumented AST, returns an array of IIDs corresponding to "top-level expressions,"
     * i.e., expressions that are not nested within another
     * @param ast
     */
    function computeTopLevelExpressions(ast) {
        var exprDepth = 0;
        var exprDepthStack = [];
        var topLevelExprs = [];
        var visitorIdentifyTopLevelExprPre = {
            "CallExpression":function (node) {
                if (node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === JALANGI_VAR) {
                    var funName = node.callee.property.name;
                    if ((exprDepth === 0 &&
                        (funName === 'A' ||
                            funName === 'P' ||
                            funName === 'G' ||
                            funName === 'R' ||
                            funName === 'W' ||
                            funName === 'H' ||
                            funName === 'T' ||
                            funName === 'Rt' ||
                            funName === 'B' ||
                            funName === 'U' ||
                            funName === 'C' ||
                            funName === 'C1' ||
                            funName === 'C2'
                            )) ||
                        (exprDepth === 1 &&
                            (funName === 'F' ||
                                funName === 'M'))) {
                        topLevelExprs.push(node.arguments[0].value);
                    }
                    exprDepth++;
                } else if (node.callee.type === 'CallExpression' &&
                    node.callee.callee.type === 'MemberExpression' &&
                    node.callee.callee.object.type === 'Identifier' &&
                    node.callee.callee.object.name === JALANGI_VAR &&
                    (node.callee.callee.property.name === 'F' ||
                        node.callee.callee.property.name === 'M')) {
                    exprDepth++;
                }
            },
            "FunctionExpression":function (node, context) {
                exprDepthStack.push(exprDepth);
                exprDepth = 0;
            },
            "FunctionDeclaration":function (node) {
                exprDepthStack.push(exprDepth);
                exprDepth = 0;
            }

        };

        var visitorIdentifyTopLevelExprPost = {
            "CallExpression":function (node) {
                if (node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === JALANGI_VAR) {
                    exprDepth--;
                } else if (node.callee.type === 'CallExpression' &&
                    node.callee.callee.type === 'MemberExpression' &&
                    node.callee.callee.object.type === 'Identifier' &&
                    node.callee.callee.object.name === JALANGI_VAR &&
                    (node.callee.callee.property.name === 'F' ||
                        node.callee.callee.property.name === 'M')) {
                    exprDepth--;
                }
                return node;
            },
            "FunctionExpression":function (node, context) {
                exprDepth = exprDepthStack.pop();
                return node;
            },
            "FunctionDeclaration":function (node) {
                exprDepth = exprDepthStack.pop();
                return node;
            }
        };
        transformAst(ast, visitorIdentifyTopLevelExprPost, visitorIdentifyTopLevelExprPre, CONTEXT.RHS);
        return topLevelExprs;
    }

    astUtil.serialize = serialize;
    astUtil.deserialize = deserialize;
    astUtil.JALANGI_VAR = JALANGI_VAR;
    astUtil.CONTEXT = CONTEXT;
    astUtil.transformAst = transformAst;
    astUtil.computeTopLevelExpressions = computeTopLevelExpressions;
})(J$);

// exports J$.astUtil
// depends on J$.Constants

/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

/*jslint node: true browser: true */
/*global astUtil acorn esotope J$ */

//var StatCollector = require('../utils/StatCollector');
if (typeof J$ === 'undefined') {
    J$ = {};
}


(function (sandbox) {
    if (typeof sandbox.instrumentCode !== 'undefined') {
        return;
    }

    var global = this;
    var JSON = {parse: global.JSON.parse, stringify: global.JSON.stringify};

    var astUtil = sandbox.astUtil;

    var Config = sandbox.Config;
    var Constants = sandbox.Constants;

    var JALANGI_VAR = Constants.JALANGI_VAR;
    var RP = JALANGI_VAR + "_";

//    var N_LOG_LOAD = 0,
//    var N_LOG_FUN_CALL = 1,
//        N_LOG_METHOD_CALL = 2,
    var N_LOG_FUNCTION_ENTER = 4,
//        N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
//        N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
//        N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
//        N_LOG_LOCAL = 15,
//        N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
//        N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19,
        N_LOG_SPECIAL = 20,
        N_LOG_STRING_LIT = 21,
        N_LOG_NUMBER_LIT = 22,
        N_LOG_BOOLEAN_LIT = 23,
        N_LOG_UNDEFINED_LIT = 24,
        N_LOG_NULL_LIT = 25;

    var logFunctionEnterFunName = JALANGI_VAR + ".Fe";
    var logFunctionReturnFunName = JALANGI_VAR + ".Fr";
    var logFunCallFunName = JALANGI_VAR + ".F";
    var logMethodCallFunName = JALANGI_VAR + ".M";
    var logAssignFunName = JALANGI_VAR + ".A";
    var logPutFieldFunName = JALANGI_VAR + ".P";
    var logGetFieldFunName = JALANGI_VAR + ".G";
    var logScriptEntryFunName = JALANGI_VAR + ".Se";
    var logScriptExitFunName = JALANGI_VAR + ".Sr";
    var logReadFunName = JALANGI_VAR + ".R";
    var logWriteFunName = JALANGI_VAR + ".W";
    var logIFunName = JALANGI_VAR + ".I";
    var logHashFunName = JALANGI_VAR + ".H";
    var logLitFunName = JALANGI_VAR + ".T";
    var logInitFunName = JALANGI_VAR + ".N";
    var logReturnFunName = JALANGI_VAR + ".Rt";
    var logThrowFunName = JALANGI_VAR + ".Th";
    var logReturnAggrFunName = JALANGI_VAR + ".Ra";
    var logUncaughtExceptionFunName = JALANGI_VAR + ".Ex";
    var logLastComputedFunName = JALANGI_VAR + ".L";
    var logTmpVarName = JALANGI_VAR + "._tm_p";
    var logSampleFunName = JALANGI_VAR + ".S";

    var logWithFunName = JALANGI_VAR + ".Wi";
    var logBinaryOpFunName = JALANGI_VAR + ".B";
    var logUnaryOpFunName = JALANGI_VAR + ".U";
    var logConditionalFunName = JALANGI_VAR + ".C";
    var logSwitchLeftFunName = JALANGI_VAR + ".C1";
    var logSwitchRightFunName = JALANGI_VAR + ".C2";
    var logLastFunName = JALANGI_VAR + "._";
    var logX1FunName = JALANGI_VAR + ".X1";

    var instrumentCodeFunName = JALANGI_VAR + ".instrumentEvalCode";


    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };


    function createBitPattern() {
        var ret = 0;
        var i;
        for (i =0; i< arguments.length; i++) {
            ret = (ret << 1)+(arguments[i]?1:0);
        }
        return ret;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function isArr(val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    }

    function MAP(arr, fun) {
        var len = arr.length;
        if (!isArr(arr)) {
            throw new TypeError();
        }
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            if (i in arr) {
                res[i] = fun(arr[i]);
            }
        }
        return res;
    }

    function regex_escape(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }


    // name of the file containing the instrumented code

    var IID_INC_STEP = 8;
    // current static identifier for each conditional expression
    var condIid;
    var memIid;
    var opIid;
    var hasInitializedIIDs = false;
    var origCodeFileName;
    var instCodeFileName;
    var iidSourceInfo;


    function getIid() {
        var tmpIid = memIid;
        memIid = memIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getPrevIidNoInc() {
        return createLiteralAst(memIid - IID_INC_STEP);
    }

    function getCondIid() {
        var tmpIid = condIid;
        condIid = condIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getOpIid() {
        var tmpIid = opIid;
        opIid = opIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }


    function printLineInfoAux(i, ast) {
        if (ast && ast.loc) {
            iidSourceInfo[i] = [ast.loc.start.line, ast.loc.start.column + 1, ast.loc.end.line, ast.loc.end.column + 1];
        }
    }

    // iid+2 is usually unallocated
    // we are using iid+2 for the sub-getField operation of a method call
    // see analysis.M
    function printSpecialIidToLoc(ast0) {
        printLineInfoAux(memIid + 2, ast0);
    }

    function printIidToLoc(ast0) {
        printLineInfoAux(memIid, ast0);
    }

    function printModIidToLoc(ast0) {
        printLineInfoAux(memIid, ast0);
        printLineInfoAux(memIid+2, ast0);
    }

    function printOpIidToLoc(ast0) {
        printLineInfoAux(opIid, ast0);
    }

    function printCondIidToLoc(ast0) {
        printLineInfoAux(condIid, ast0);
    }

// J$_i in expression context will replace it by an AST
// {J$_i} will replace the body of the block statement with an array of statements passed as argument

    function replaceInStatement(code) {
        var asts = arguments;
        var visitorReplaceInExpr = {
            'Identifier': function (node) {
                if (node.name.indexOf(RP) === 0) {
                    var i = parseInt(node.name.substring(RP.length));
                    return asts[i];
                } else {
                    return node;
                }
            },
            'BlockStatement': function (node) {
                if (node.body[0].type === 'ExpressionStatement' && isArr(node.body[0].expression)) {
                    node.body = node.body[0].expression;
                }
                return node;
            }
        };
//        StatCollector.resumeTimer("internalParse");
        var ast = acorn.parse(code);
//        StatCollector.suspendTimer("internalParse");
//        StatCollector.resumeTimer("replace");
        var newAst = astUtil.transformAst(ast, visitorReplaceInExpr, undefined, undefined, true);
        //console.log(newAst);
//        StatCollector.suspendTimer("replace");
        return newAst.body;
    }

    function replaceInExpr(code) {
        var ret = replaceInStatement.apply(this, arguments);
        return ret[0].expression;
    }

    function createLiteralAst(name) {
        return {type: Syntax.Literal, value: name};
    }

    function createIdentifierAst(name) {
        return {type: Syntax.Identifier, name: name};
    }

    function transferLoc(toNode, fromNode) {
        if (fromNode.loc)
            toNode.loc = fromNode.loc;
        if (fromNode.raw)
            toNode.raw = fromNode.loc;
    }

    function idsOfGetterSetter(node) {
        var ret = {}, isEmpty = true;
        if (node.type === "ObjectExpression") {
            var kind, len = node.properties.length;
            for (var i = 0; i < len; i++) {
                if ((kind = node.properties[i].kind) === 'get' || kind === 'set') {
                    ret[kind + node.properties[i].key.name] = node.properties[i].value.funId;
                    isEmpty = false;
                }
            }
        }
        return isEmpty ? undefined : ret;
    }

    function checkAndGetIid(funId, sid, funName) {
        var id = getIid();
        if (!Config.requiresInstrumentation || Config.requiresInstrumentation(id, funId, sid, funName)) {
            return id;
        } else {
            return undefined;
        }
    }

    function modifyAst(ast, modifier, term) {
        var ret;
        var i = 3; // no. of formal parameters
        while (term.indexOf('$$') >= 0) {
            term = term.replace(/\$\$/, arguments[i]);
            i++;
        }
        var args = [];
        args.push(term);
        for (; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        printIidToLoc(ast);
        ret = modifier.apply(this, args);
        transferLoc(ret, ast);
        return ret;
    }

    function wrapPutField(node, base, offset, rvalue, isComputed) {
        if (!Config.INSTR_PUTFIELD || Config.INSTR_PUTFIELD(isComputed ? null : offset.value, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logPutFieldFunName +
                "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isComputed, false)) + ")",
                getIid(),
                base,
                offset,
                rvalue
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapModAssign(node, base, offset, op, rvalue, isComputed) {
        if (!Config.INSTR_PROPERTY_BINARY_ASSIGNMENT || Config.INSTR_PROPERTY_BINARY_ASSIGNMENT(op, node.computed ? null : offset.value, node)) {
            printModIidToLoc(node);
            var ret = replaceInExpr(
                logAssignFunName + "(" + RP + "1," + RP + "2," + RP + "3," + RP + "4," + (createBitPattern(isComputed)) + ")(" + RP + "5)",
                getIid(),
                base,
                offset,
                createLiteralAst(op),
                rvalue
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapMethodCall(node, base, offset, isCtor, isComputed) {
        printIidToLoc(node);
        printSpecialIidToLoc(node.callee);
        var ret = replaceInExpr(
            logMethodCallFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + (createBitPattern(isCtor, isComputed)) + ")",
            getIid(),
            base,
            offset
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapFunCall(node, ast, isCtor) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logFunCallFunName + "(" + RP + "1, " + RP + "2, " + (createBitPattern(isCtor)) + ")",
            getIid(),
            ast
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapGetField(node, base, offset, isComputed) {
        if (!Config.INSTR_GETFIELD || Config.INSTR_GETFIELD(node.computed ? null : offset.value, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logGetFieldFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (createBitPattern(isComputed,false, false)) + ")",
                getIid(),
                base,
                offset
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapRead(node, name, val, isReUseIid, isGlobal, isScriptLocal) {
        if (!Config.INSTR_READ || Config.INSTR_READ(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logReadFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (createBitPattern(isGlobal,isScriptLocal)) + ")",
                isReUseIid ? getPrevIidNoInc() : getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

//    function wrapReadWithUndefinedCheck(node, name) {
//        var ret = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
//        transferLoc(ret, node);
//        return ret;
//    }

    function wrapReadWithUndefinedCheck(node, name) {
        var ret;

        //if (name !== 'location') {
        //    ret = replaceInExpr(
        //        "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + name + "=" + RP + "2) : (" + name + "=" + RP + "3)))",
        //        createIdentifierAst(name),
        //        wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, true),
        //        wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, true)
        //    );
        //} else {
            ret = replaceInExpr(
                "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + RP + "2) : (" + RP + "3)))",
                createIdentifierAst(name),
                wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, false),
                wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, false)
            );
//        }
        transferLoc(ret, node);
        return ret;
    }

    function wrapWrite(node, name, val, lhs, isGlobal, isScriptLocal, isDeclaration) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isGlobal,isScriptLocal,isDeclaration)) + ")",
                getIid(),
                name,
                val,
                lhs
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

    function wrapWriteWithUndefinedCheck(node, name, val, lhs) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
//        var ret2 = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
            var ret = replaceInExpr(
                logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + logIFunName + "(typeof(" + lhs.name + ")==='undefined'?undefined:" + lhs.name + ")," + createBitPattern(true, false, false) +")",
                getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

    function wrapRHSOfModStore(node, left, right, op) {
        var ret = replaceInExpr(RP + "1 " + op + " " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function makeNumber(node, left) {
        var ret = replaceInExpr(" + " + RP + "1 ", left);
        transferLoc(ret, node);
        return ret;
    }

    function wrapLHSOfModStore(node, left, right) {
        var ret = replaceInExpr(RP + "1 = " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function ifObjectExpressionHasGetterSetter(node) {
        if (node.type === "ObjectExpression") {
            var kind, len = node.properties.length;
            for (var i = 0; i < len; i++) {
                if ((kind = node.properties[i].kind) === 'get' || kind === 'set') {
                    return true;
                }
            }
        }
        return false;
    }

    var dummyFun = function () {
    };
    var dummyObject = {};
    var dummyArray = [];

    function getLiteralValue(funId, node) {
        if (node.name === "undefined") {
            return undefined;
        } else if (node.name === "NaN") {
            return NaN;
        } else if (node.name === "Infinity") {
            return Infinity;
        }
        switch (funId) {
            case N_LOG_NUMBER_LIT:
            case N_LOG_STRING_LIT:
            case N_LOG_NULL_LIT:
            case N_LOG_REGEXP_LIT:
            case N_LOG_BOOLEAN_LIT:
                return node.value;
            case N_LOG_ARRAY_LIT:
                return dummyArray;
            case N_LOG_FUNCTION_LIT:
                return dummyFun;
            case N_LOG_OBJECT_LIT:
                return dummyObject;
        }
        throw new Error(funId + " not known");
    }

    function getFnIdFromAst(ast) {
        var entryExpr = ast.body.body[0];
        if (entryExpr.type != 'ExpressionStatement') {
            console.log(JSON.stringify(entryExpr));
            throw new Error("IllegalStateException");
        }
        entryExpr = entryExpr.expression;
        if (entryExpr.type != 'CallExpression') {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.type != 'MemberExpression') {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.object.name != JALANGI_VAR) {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.property.name != 'Fe') {
            throw new Error("IllegalStateException");
        }
        return entryExpr['arguments'][0].value;
    }

    function wrapLiteral(node, ast, funId) {
        if (!Config.INSTR_LITERAL || Config.INSTR_LITERAL(getLiteralValue(funId, node), node)) {
            printIidToLoc(node);
            var hasGetterSetter = ifObjectExpressionHasGetterSetter(node);

            var ret;
            if (funId == N_LOG_FUNCTION_LIT) {
                var internalFunId = null;
                if (node.type == 'FunctionExpression') {
                    internalFunId = getFnIdFromAst(node);
                } else {
                    if (node.type != 'Identifier') {
                        throw new Error("IllegalStateException");
                    }
                    internalFunId = getFnIdFromAst(scope.funNodes[node.name]);
                }
                ret = replaceInExpr(
                    logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + hasGetterSetter + ", " + internalFunId + ")",
                    getIid(),
                    ast,
                    createLiteralAst(funId),
                    internalFunId
                );
            } else {
                ret = replaceInExpr(
                    logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + hasGetterSetter + ")",
                    getIid(),
                    ast,
                    createLiteralAst(funId)
                );
            }
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapReturn(node, expr) {
        var lid = (expr === null) ? node : expr;
        printIidToLoc(lid);
        if (expr === null) {
            expr = createIdentifierAst("undefined");
        }
        var ret = replaceInExpr(
            logReturnFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            expr
        );
        transferLoc(ret, lid);
        return ret;
    }

    function wrapThrow(node, expr) {
        printIidToLoc(expr);
        var ret = replaceInExpr(
            logThrowFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            expr
        );
        transferLoc(ret, expr);
        return ret;
    }

    function wrapWithX1(node, ast) {
        if (!Config.INSTR_END_EXPRESSION || Config.INSTR_END_EXPRESSION(node)) {

            if (!ast || ast.type.indexOf("Expression") <= 0) return ast;
            printIidToLoc(node);
            var ret = replaceInExpr(
                logX1FunName + "(" + RP + "1," + RP + "2)", getIid(), ast);
            transferLoc(ret, node);
            return ret;
        } else {
            return ast;
        }
    }

    function wrapHash(node, ast) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logHashFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            ast
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapEvalArg(ast) {
        printIidToLoc(ast);
        var ret = replaceInExpr(
            instrumentCodeFunName + "(" + RP + "1, " + RP + "2, true)",
            ast,
            getIid()
        );
        transferLoc(ret, ast);
        return ret;
    }

    function wrapUnaryOp(node, argument, operator) {
        if (!Config.INSTR_UNARY || Config.INSTR_UNARY(operator, node)) {
            printOpIidToLoc(node);
            var ret = replaceInExpr(
                logUnaryOpFunName + "(" + RP + "1," + RP + "2," + RP + "3)",
                getOpIid(),
                createLiteralAst(operator),
                argument
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapBinaryOp(node, left, right, operator, isComputed) {
        if (!Config.INSTR_BINARY || Config.INSTR_BINARY(operator, operator)) {
            printOpIidToLoc(node);
            var ret = replaceInExpr(
                logBinaryOpFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isComputed, false, false)) + ")",
                getOpIid(),
                createLiteralAst(operator),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapLogicalAnd(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("&&", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + RP + "3:" + logLastFunName + "()",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapLogicalOr(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("||", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + logLastFunName + "():" + RP + "3",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchDiscriminant(node, discriminant) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logSwitchLeftFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                discriminant
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchTest(node, test) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logSwitchRightFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapWith(node) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("with", node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logWithFunName + "(" + RP + "1, " + RP + "2)",
                getIid(),
                node
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapConditional(node, test) {
        if (node === null) {
            return node;
        } // to handle for(;;) ;

        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("other", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }

    }

//    function createCallWriteAsStatement(node, name, val) {
//        printIidToLoc(node);
//        var ret = replaceInStatement(
//            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
//            getIid(),
//            name,
//            val
//        );
//        transferLoc(ret[0].expression, node);
//        return ret;
//    }

    function createExpressionStatement(lhs, node) {
        var ret;
        ret = replaceInStatement(
            RP + "1 = " + RP + "2", lhs, node
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallInitAsStatement(node, name, val, isArgumentSync, lhs, isCatchParam, isAssign) {
        printIidToLoc(node);
        var ret;

        if (isAssign)
            ret = replaceInStatement(
                RP + "1 = " + logInitFunName + "(" + RP + "2, " + RP + "3, " + RP + "4, " + createBitPattern(isArgumentSync, false, isCatchParam) + ")",
                lhs,
                getIid(),
                name,
                val
            );
        else
            ret = replaceInStatement(
                logInitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + createBitPattern(isArgumentSync, false, isCatchParam) + ")",
                getIid(),
                name,
                val
            );

        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsFunEnterStatement(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            logFunctionEnterFunName + "(" + RP + "1,arguments.callee, this, arguments)",
            getIid()
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsScriptEnterStatement(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(logScriptEntryFunName + "(" + RP + "1," + RP + "2, " + RP + "3)",
            getIid(),
            createLiteralAst(instCodeFileName), createLiteralAst(origCodeFileName));
        transferLoc(ret[0].expression, node);
        return ret;
    }

    var labelCounter = 0;

    function wrapForIn(node, left, right, body) {
        printIidToLoc(node);
        var tmp, extra, isDeclaration = (left.type === 'VariableDeclaration');
        if (isDeclaration) {
            var name = node.left.declarations[0].id.name;
            tmp = replaceInExpr(name + " = " + logTmpVarName);
        } else {
            tmp = replaceInExpr(RP + "1 = " + logTmpVarName, left);
        }
        transferLoc(tmp, node);
        extra = instrumentStore(tmp, isDeclaration);

        var ret;

        if (body.type === 'BlockExpression') {
            body = body.body;
        } else {
            body = [body];
        }
        if (isDeclaration) {
            ret = replaceInStatement(
                "function n() {  for(" + logTmpVarName + " in " + RP + "1) {var " + name + " = " + RP + "2;\n {" + RP + "3}}}", right, wrapWithX1(node, extra.right), body);
        } else {
            ret = replaceInStatement(
                "function n() {  for(" + logTmpVarName + " in " + RP + "1) {" + RP + "2;\n {" + RP + "3}}}", right, wrapWithX1(node, extra), body);
        }
        ret = ret[0].body.body[0];
        transferLoc(ret, node);
        return ret;
    }


    function wrapForInBody(node, body, name) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            "function n() { " + logInitFunName + "(" + RP + "1, '" + name + "'," + name + ","+createBitPattern(false, true, false)+");\n {" + RP + "2}}", getIid(), [body]);

        ret = ret[0].body;
        transferLoc(ret, node);
        return ret;
    }

    function wrapCatchClause(node, body, name) {
        var ret;
        if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
            body.unshift(createCallInitAsStatement(node,
                createLiteralAst(name),
                createIdentifierAst(name),
                false, createIdentifierAst(name), true, true)[0]);
        }
    }

    function wrapScriptBodyWithTryCatch(node, body) {
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            printIidToLoc(node);
            var iid1 = getIid();
            printIidToLoc(node);
            var l = labelCounter++;
            var ret = replaceInStatement(
                "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + JALANGI_VAR +
                "e) { //console.log(" + JALANGI_VAR + "e); console.log(" +
                JALANGI_VAR + "e.stack);\n  " + logUncaughtExceptionFunName + "(" + RP + "2," + JALANGI_VAR +
                "e); } finally { if (" + logScriptExitFunName + "(" +
                RP + "3)) { " + logLastComputedFunName + "(); continue jalangiLabel" + l + ";\n } else {\n  " + logLastComputedFunName + "(); break jalangiLabel" + l + ";\n }}\n }}", body,
                iid1,
                getIid()
            );
            //console.log(JSON.stringify(ret));

            ret = ret[0].body.body;
            transferLoc(ret[0], node);
            return ret;
        } else {
            return body;
        }
    }

    function wrapFunBodyWithTryCatch(node, body) {
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            printIidToLoc(node);
            var iid1 = getIid();
            printIidToLoc(node);
            var l = labelCounter++;
            var ret = replaceInStatement(
                "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + JALANGI_VAR +
                "e) { //console.log(" + JALANGI_VAR + "e); console.log(" +
                JALANGI_VAR + "e.stack);\n " + logUncaughtExceptionFunName + "(" + RP + "2," + JALANGI_VAR +
                "e); } finally { if (" + logFunctionReturnFunName + "(" +
                RP + "3)) continue jalangiLabel" + l + ";\n else \n  return " + logReturnAggrFunName + "();\n }\n }}", body,
                iid1,
                getIid()
            );
            //console.log(JSON.stringify(ret));

            ret = ret[0].body.body;
            transferLoc(ret[0], node);
            return ret;
        } else {
            return body;
        }
    }

    function syncDefuns(node, scope, isScript) {
        var ret = [], ident;
        if (!isScript) {
            if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
                if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                    ident = createIdentifierAst("arguments");
                    ret = ret.concat(createCallInitAsStatement(node,
                        createLiteralAst("arguments"),
                        ident,
                        true,
                        ident, false, true));
                }
            }
        }
        if (scope) {
                for (var name in scope.vars) {
                    if (HOP(scope.vars, name)) {
                        if (scope.vars[name] === "defun") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT),
                                    false,
                                    ident, false, true));
                            } else {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(
                                    createExpressionStatement(ident,
                                        wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT)));
                            }
                        }
                        if (scope.vars[name] === "lambda") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name), ident,
                                    false,
                                    ident, false, true));
                            }
                        }
                        if (scope.vars[name] === "arg") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    ident,
                                    true,
                                    ident, false, true));
                            }
                        }
                        if (scope.vars[name] === "var") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    createIdentifierAst(name),
                                    false, undefined, false, false));
                            }
                        }
                    }
                }
        }
        return ret;
    }


    var scope;


    function instrumentFunctionEntryExit(node, ast) {
        var body;
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            body = createCallAsFunEnterStatement(node);
        } else {
            body = [];
        }
        body = body.concat(syncDefuns(node, scope, false)).concat(ast);
        return body;
    }

//    function instrumentFunctionEntryExit(node, ast) {
//        return wrapFunBodyWithTryCatch(node, ast);
//    }

    /**
     * instruments entry of a script.  Adds the script entry (J$.Se) callback,
     * and the J$.N init callbacks for locals.
     *
     */
    function instrumentScriptEntryExit(node, body0) {
        var body;
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            body = createCallAsScriptEnterStatement(node)
        } else {
            body = [];
        }
        body = body.concat(syncDefuns(node, scope, true)).
            concat(body0);
        return body;
    }


    function getPropertyAsAst(ast) {
        return ast.computed ? ast.property : createLiteralAst(ast.property.name);
    }

    function instrumentCall(callAst, isCtor) {
        var ast = callAst.callee;
        var ret;
        if (ast.type === 'MemberExpression') {
            ret = wrapMethodCall(callAst, ast.object,
                getPropertyAsAst(ast),
                isCtor, ast.computed);
            return ret;
        } else if (ast.type === 'Identifier' && ast.name === "eval") {
            return ast;
        } else {
            ret = wrapFunCall(callAst, ast, isCtor);
            return ret;
        }
    }

    function instrumentStore(node, isDeclaration) {
        var ret;
        if (node.left.type === 'Identifier') {
            if (scope.hasVar(node.left.name)) {
                ret = wrapWrite(node.right, createLiteralAst(node.left.name), node.right, node.left, false, scope.isGlobal(node.left.name), isDeclaration);
            } else {
                ret = wrapWriteWithUndefinedCheck(node.right, createLiteralAst(node.left.name), node.right, node.left);

            }
            node.right = ret;
            return node;
        } else {
            ret = wrapPutField(node, node.left.object, getPropertyAsAst(node.left), node.right, node.left.computed);
            return ret;
        }
    }

    function instrumentLoad(ast, isTypeof) {
        var ret;
        if (ast.type === 'Identifier') {
            if (ast.name === "undefined") {
                ret = wrapLiteral(ast, ast, N_LOG_UNDEFINED_LIT);
                return ret;
            } else if (ast.name === "NaN" || ast.name === "Infinity") {
                ret = wrapLiteral(ast, ast, N_LOG_NUMBER_LIT);
                return ret;
            }
            if (ast.name === JALANGI_VAR) {
                return ast;
            } else if (scope.hasVar(ast.name)) {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast, false, false, scope.isGlobal(ast.name));
                return ret;
            } else if (isTypeof) {
                ret = wrapReadWithUndefinedCheck(ast, ast.name);
                return ret;
            } else {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast, false, true, false)
                return ret;
            }

        } else if (ast.type === 'MemberExpression') {
            return wrapGetField(ast, ast.object, getPropertyAsAst(ast), ast.computed);
        } else {
            return ast;
        }
    }

    function instrumentLoadModStore(node, isNumber) {
        if (node.left.type === 'Identifier') {
            var tmp0 = instrumentLoad(node.left, false);
            if (isNumber) {
                tmp0 = makeNumber(node, instrumentLoad(tmp0, false));
            }
            var tmp1 = wrapRHSOfModStore(node.right, tmp0, node.right, node.operator.substring(0, node.operator.length - 1));

            var tmp2;
            if (scope.hasVar(node.left.name)) {
                tmp2 = wrapWrite(node, createLiteralAst(node.left.name), tmp1, node.left, false, scope.isGlobal(node.left.name), false);
            } else {
                tmp2 = wrapWriteWithUndefinedCheck(node, createLiteralAst(node.left.name), tmp1, node.left);

            }
            tmp2 = wrapLHSOfModStore(node, node.left, tmp2);
            return tmp2;
        } else {
            var ret = wrapModAssign(node, node.left.object,
                getPropertyAsAst(node.left),
                node.operator.substring(0, node.operator.length - 1),
                node.right, node.left.computed);
            return ret;
        }
    }

    function instrumentPreIncDec(node) {
        var right = createLiteralAst(1);
        right = wrapLiteral(right, right, N_LOG_NUMBER_LIT);
        var ret = wrapRHSOfModStore(node, node.argument, right, node.operator.substring(0, 1) + "=");
        return instrumentLoadModStore(ret, true);
    }

    function adjustIncDec(op, ast) {
        if (op === '++') {
            op = '-';
        } else {
            op = '+';
        }
        var right = createLiteralAst(1);
        right = wrapLiteral(right, right, N_LOG_NUMBER_LIT);
        var ret = wrapRHSOfModStore(ast, ast, right, op);
        return ret;
    }
	
    // Should 'Program' nodes in the AST be wrapped with prefix code to load libraries,
    // code to indicate script entry and exit, etc.?
    // we need this flag since when we're instrumenting eval'd code, the code is parsed
    // as a top-level 'Program', but the wrapping code may not be syntactically valid in
    // the surrounding context, e.g.:
    //    var y = eval("x + 1");

    function setScope(node) {
        scope = node.scope;
    }

    function funCond0(node) {
        node.test = wrapWithX1(node, node.test);
        node.init = wrapWithX1(node, node.init);
        node.update = wrapWithX1(node, node.update);
        return node;
    }

    function mergeBodies(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            "function n() { if (!" + logSampleFunName + "(" + RP + "1, arguments.callee)){" + RP + "2} else {" + RP + "3}}",
            getIid(),
            node.bodyOrig.body,
            node.body.body
        );

        node.body.body = ret[0].body.body;
        delete node.bodyOrig;
        return node;
    }

    function regExpToJSON() {
        var str = this.source;
        var glb = this.global;
        var ignoreCase = this.ignoreCase;
        var multiline = this.multiline;
        var obj = {
            type: 'J$.AST.REGEXP',
            value: str,
            glb: glb,
            ignoreCase: ignoreCase,
            multiline: multiline
        }
        return obj;
    }

    function JSONStringifyHandler(key, value) {
        if (key === 'scope') {
            return undefined;
        } if (value instanceof RegExp) {
            return regExpToJSON.call(value);
        } else {
            return value;
        }
    }

    function JSONParseHandler(key, value) {
        var ret = value, flags = '';
        if (typeof value === 'object' && value && value.type === 'J$.AST.REGEXP') {
            if (value.glb)
                flags += 'g';
            if (value.ignoreCase)
                flags += 'i';
            if (value.multiline)
                flags += 'm';
            ret = RegExp(value.value, flags);
        }
        return ret;
    }

    function clone(src) {
        var ret = JSON.parse(JSON.stringify(src, JSONStringifyHandler), JSONParseHandler);
        return ret;
    }

    /*
     function constructEmptyObject(o) {
     function F() {}
     F.prototype = o;
     return new F();
     }

     function clone(src) { // from http://davidwalsh.name/javascript-clone
     function mixin(dest, source, copyFunc) {
     var name, s, i, empty = {};
     for(name in source){
     // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
     // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
     // don't overwrite it with the toString() method that source inherited from Object.prototype
     s = source[name];
     if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
     dest[name] = copyFunc ? copyFunc(s) : s;
     }
     }
     return dest;
     }

     if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
     // null, undefined, any non-object, or function
     return src;	// anything
     }
     if(src.nodeType && "cloneNode" in src){
     // DOM Node
     return src.cloneNode(true); // Node
     }
     if(src instanceof Date){
     // Date
     return new Date(src.getTime());	// Date
     }
     if(src instanceof RegExp){
     // RegExp
     return new RegExp(src);   // RegExp
     }
     var r, i, l;
     if(src instanceof Array){
     // array
     r = [];
     for(i = 0, l = src.length; i < l; ++i){
     if(i in src){
     r.push(clone(src[i]));
     }
     }
     // we don't clone functions for performance reasons
     //		}else if(d.isFunction(src)){
     //			// function
     //			r = function(){ return src.apply(this, arguments); };
     }else{
     // generic objects
     try {
     r = constructEmptyObject(src);
     //                r = src.constructor ? new src.constructor() : {};
     } catch (e) {
     console.log(src);
     throw e;
     }
     }
     return mixin(r, src, clone);

     }
     */
    var visitorCloneBodyPre = {
        "FunctionExpression": function (node) {
            node.bodyOrig = clone(node.body);
            return node;
        },
        "FunctionDeclaration": function (node) {
            node.bodyOrig = clone(node.body);
            return node;
        }
    };

    var visitorMergeBodyPre = {
        "FunctionExpression": mergeBodies,
        "FunctionDeclaration": mergeBodies
    };

    var visitorRRPre = {
        'Program': setScope,
        'FunctionDeclaration': setScope,
        'FunctionExpression': setScope,
        'CatchClause': setScope
    };

    var visitorRRPost = {
        'Literal': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {

                var litType;
                switch (typeof node.value) {
                    case 'number':
                        litType = N_LOG_NUMBER_LIT;
                        break;
                    case 'string':
                        litType = N_LOG_STRING_LIT;
                        break;
                    case 'object': // for null
                        if (node.value === null)
                            litType = N_LOG_NULL_LIT;
                        else
                            litType = N_LOG_REGEXP_LIT;
                        break;
                    case 'boolean':
                        litType = N_LOG_BOOLEAN_LIT;
                        break;
                }
                var ret1 = wrapLiteral(node, node, litType);
                return ret1;
            } else {
                return node;
            }
        },
        "Program": function (node) {
            var ret = instrumentScriptEntryExit(node, node.body);
            node.body = ret;

            scope = scope.parent;
            return node;
        },
        "VariableDeclaration": function (node) {
            var declarations = MAP(node.declarations, function (def) {
                if (def.init !== null) {
                    var init = wrapWrite(def.init, createLiteralAst(def.id.name), def.init, def.id, false, scope.isGlobal(def.id.name), true);
                    init = wrapWithX1(def.init, init);
                    def.init = init;
                }
                return def;
            });
            node.declarations = declarations;
            return node;
        },
        "NewExpression": function (node) {
            var ret = {
                type: 'CallExpression',
                callee: instrumentCall(node, true),
                'arguments': node.arguments
            };
            transferLoc(ret, node);
            return ret;
//            var ret1 = wrapLiteral(node, ret, N_LOG_OBJECT_LIT);
//            return ret1;
        },
        "CallExpression": function (node) {
            var isEval = node.callee.type === 'Identifier' && node.callee.name === "eval";
            var callee = instrumentCall(node, false);
            node.callee = callee;
            if (isEval) {
                node.arguments = MAP(node.arguments, wrapEvalArg);
            }
            return node;
        },
        "AssignmentExpression": function (node) {
            var ret1;
            if (node.operator === "=") {
                ret1 = instrumentStore(node, false);
            } else {
                ret1 = instrumentLoadModStore(node);
            }
            return ret1;
        },
        "UpdateExpression": function (node) {
            var ret1;
            ret1 = instrumentPreIncDec(node);
            if (!node.prefix) {
                ret1 = adjustIncDec(node.operator, ret1);
            }
            return ret1;
        },
        "FunctionExpression": function (node, context) {
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            var ret1;
            if (context === astUtil.CONTEXT.GETTER || context === astUtil.CONTEXT.SETTER) {
                ret1 = node;
            } else {
                ret1 = wrapLiteral(node, node, N_LOG_FUNCTION_LIT);
            }
            scope = scope.parent;
            return ret1;
        },
        "FunctionDeclaration": function (node) {
            //console.log(node.body.body);
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            scope = scope.parent;
            return node;
        },
        "ObjectExpression": function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_OBJECT_LIT);
            return ret1;
        },
        "ArrayExpression": function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_ARRAY_LIT);
            return ret1;
        },
        'ThisExpression': function (node) {
            var ret = wrapRead(node, createLiteralAst('this'), node, false, false, false);
            return ret;
        },
        'Identifier': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node, false);
                return ret;
            } else if (context === astUtil.CONTEXT.TYPEOF) {
                ret = instrumentLoad(node, true);
                return ret;
            } else {
                return node;
            }
        },
        'MemberExpression': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node, false);
                return ret;
            } else {
                return node;
            }
        },
        "SequenceExpression": function (node) {
            var i = 0, len = node.expressions.length;
            for (i = 0; i < len - 1 /* the last expression is the result, do not wrap that */; i++) {
                node.expressions[i] = wrapWithX1(node.expressions[i], node.expressions[i]);
            }
            return node;
        },
        "ForInStatement": function (node) {
            var ret = wrapHash(node.right, node.right);
            node.right = ret;

            node = wrapForIn(node, node.left, node.right, node.body);
            //var name;
            //if (node.left.type === 'VariableDeclaration') {
            //    name = node.left.declarations[0].id.name;
            //} else {
            //    name = node.left.name;
            //}
            //node.body = wrapForInBody(node, node.body, name);
            return node;
        },
        "CatchClause": function (node) {
            var name;
            name = node.param.name;
            wrapCatchClause(node, node.body.body, name);
            scope = scope.parent;
            return node;
        },
        "ReturnStatement": function (node) {
            var ret = wrapReturn(node, node.argument);
            node.argument = wrapWithX1(node, ret);
            return node;
        },
        "ThrowStatement": function (node) {
            var ret = wrapThrow(node, node.argument);
            node.argument = wrapWithX1(node, ret);
            return node;
        },

        "ExpressionStatement": function (node) {
            node.expression = wrapWithX1(node, node.expression);
            return node;
        }
    };

    function funCond(node) {
        var ret = wrapConditional(node.test, node.test);
        node.test = ret;
        node.test = wrapWithX1(node, node.test);
        node.init = wrapWithX1(node, node.init);
        node.update = wrapWithX1(node, node.update);
        return node;
    }


    var visitorOps = {
        "Program": function (node) {
            var body = wrapScriptBodyWithTryCatch(node, node.body);
//                var ret = prependScriptBody(node, body);
            node.body = body;

            return node;
        },
        'BinaryExpression': function (node) {
            var ret = wrapBinaryOp(node, node.left, node.right, node.operator);
            return ret;
        },
        'LogicalExpression': function (node) {
            var ret;
            if (node.operator === "&&") {
                ret = wrapLogicalAnd(node, node.left, node.right);
            } else if (node.operator === "||") {
                ret = wrapLogicalOr(node, node.left, node.right);
            }
            return ret;
        },
        'UnaryExpression': function (node) {
            var ret;
            if (node.operator === "void") {
                return node;
            } else if (node.operator === "delete") {
                if (node.argument.object) {
                    ret = wrapBinaryOp(node, node.argument.object, getPropertyAsAst(node.argument), node.operator, node.argument.computed);
                } else {
                    return node;
                }
            } else {
                ret = wrapUnaryOp(node, node.argument, node.operator);
            }
            return ret;
        },
        "SwitchStatement": function (node) {
            var dis = wrapSwitchDiscriminant(node.discriminant, node.discriminant);
            dis = wrapWithX1(node.discriminant, dis);
            var cases = MAP(node.cases, function (acase) {
                var test;
                if (acase.test) {
                    test = wrapSwitchTest(acase.test, acase.test);
                    acase.test = wrapWithX1(acase.test, test);
                }
                return acase;
            });
            node.discriminant = dis;
            node.cases = cases;
            return node;
        },
        "FunctionExpression": function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "FunctionDeclaration": function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "WithStatement": function (node) {
            node.object = wrapWith(node.object);
            return node;
        },
        "ConditionalExpression": funCond,
        "IfStatement": funCond,
        "WhileStatement": funCond,
        "DoWhileStatement": funCond,
        "ForStatement": funCond
    };

    function addScopes(ast) {

        function Scope(parent, isCatch) {
            this.vars = {};
            this.funLocs = {};
            this.funNodes = {};
            this.hasEval = false;
            this.hasArguments = false;
            this.parent = parent;
            this.isCatch = isCatch;
        }

        Scope.prototype.addVar = function (name, type, loc, node) {
            var tmpScope = this;
            if (this.isCatch && type !== 'catch') {
                tmpScope = this.parent;
            }

            if (tmpScope.vars[name] !== 'arg') {
                tmpScope.vars[name] = type;
            }
            if (type === 'defun') {
                tmpScope.funLocs[name] = loc;
                tmpScope.funNodes[name] = node;
            }
        };

        Scope.prototype.hasOwnVar = function (name) {
            var s = this;
            if (s && HOP(s.vars, name))
                return s.vars[name];
            return null;
        };

        Scope.prototype.hasVar = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name))
                    return s.vars[name];
                s = s.parent;
            }
            return null;
        };

        Scope.prototype.isGlobal = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name) && s.parent !== null) {
                    return false;
                }
                s = s.parent;
            }
            return true;
        };

        Scope.prototype.addEval = function () {
            var s = this;
            while (s !== null) {
                s.hasEval = true;
                s = s.parent;
            }
        };

        Scope.prototype.addArguments = function () {
            var s = this;
            while (s !== null) {
                s.hasArguments = true;
                s = s.parent;
            }
        };

        Scope.prototype.usesEval = function () {
            return this.hasEval;
        };

        Scope.prototype.usesArguments = function () {
            return this.hasArguments;
        };


        var currentScope = null;

        // rename arguments to J$_arguments
        var fromName = 'arguments';
        var toName = JALANGI_VAR + "_arguments";

        function handleFun(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope);
            node.scope = currentScope;
            if (node.type === 'FunctionDeclaration') {
                oldScope.addVar(node.id.name, "defun", node.loc, node);
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
            } else if (node.type === 'FunctionExpression') {
                if (node.id !== null) {
                    currentScope.addVar(node.id.name, "lambda");
                }
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
            }
        }

        function handleVar(node) {
            currentScope.addVar(node.id.name, "var");
        }

        function handleCatch(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope, true);
            node.scope = currentScope;
            currentScope.addVar(node.param.name, "catch");
        }

        function popScope(node) {
            currentScope = currentScope.parent;
            return node;
        }

        var visitorPre = {
            'Program': handleFun,
            'FunctionDeclaration': handleFun,
            'FunctionExpression': handleFun,
            'VariableDeclarator': handleVar,
            'CatchClause': handleCatch
        };

        var visitorPost = {
            'Program': popScope,
            'FunctionDeclaration': popScope,
            'FunctionExpression': popScope,
            'CatchClause': popScope,
            'Identifier': function (node, context) {         // rename arguments to J$_arguments
                if (context === astUtil.CONTEXT.RHS && node.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.name = toName;
                }
                return node;
            },
            "UpdateExpression": function (node) {         // rename arguments to J$_arguments
                if (node.argument.type === 'Identifier' && node.argument.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.argument.name = toName;
                }
                return node;
            },
            "AssignmentExpression": function (node) {         // rename arguments to J$_arguments
                if (node.left.type === 'Identifier' && node.left.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.left.name = toName;
                }
                return node;
            }

        };
        astUtil.transformAst(ast, visitorPost, visitorPre);
    }


    // START of Liang Gong's AST post-processor
    function hoistFunctionDeclaration(ast, hoisteredFunctions) {
        var key, child, startIndex = 0;
        if (ast.body) {
            var newBody = [];
            if (ast.body.length > 0) { // do not hoister function declaration before J$.Fe or J$.Se
                if (ast.body[0].type === 'ExpressionStatement') {
                    if (ast.body[0].expression.type === 'CallExpression') {
                        if (ast.body[0].expression.callee.object &&
                            ast.body[0].expression.callee.object.name === 'J$'
                            && ast.body[0].expression.callee.property
                            &&
                            (ast.body[0].expression.callee.property.name === 'Se' || ast.body[0].
                                expression.callee.property.name === 'Fe')) {

                            newBody.push(ast.body[0]);
                            startIndex = 1;
                        }
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {

                if (ast.body[i].type === 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                    if (newBody.length !== i + 1) {
                        hoisteredFunctions.push(ast.body[i].id.name);
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {
                if (ast.body[i].type !== 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                }
            }
            while (ast.body.length > 0) {
                ast.body.pop();
            }
            for (var i = 0; i < newBody.length; i++) {
                ast.body.push(newBody[i]);
            }
        } else {
            //console.log(typeof ast.body);
        }
        for (key in ast) {
            if (ast.hasOwnProperty(key)) {
                child = ast[key];
                if (typeof child === 'object' && child !== null && key !==
                    "scope") {
                    hoistFunctionDeclaration(child, hoisteredFunctions);
                }

            }
        }

        return ast;
    }

    // END of Liang Gong's AST post-processor

    function transformString(code, visitorsPost, visitorsPre) {
//         StatCollector.resumeTimer("parse");
//        console.time("parse")
//        var newAst = esprima.parse(code, {loc:true, range:true});
        var newAst = acorn.parse(code, {locations: true, ecmaVersion: 6 });
//        console.timeEnd("parse")
//        StatCollector.suspendTimer("parse");
//        StatCollector.resumeTimer("transform");
//        console.time("transform")
        addScopes(newAst);
        var len = visitorsPost.length;
        for (var i = 0; i < len; i++) {
            newAst = astUtil.transformAst(newAst, visitorsPost[i], visitorsPre[i], astUtil.CONTEXT.RHS);
        }
//        console.timeEnd("transform")
//        StatCollector.suspendTimer("transform");
//        console.log(JSON.stringify(newAst,null,"  "));
        return newAst;
    }

    // if this string is discovered inside code passed to instrumentCode(),
    // the code will not be instrumented
    var noInstr = "// JALANGI DO NOT INSTRUMENT";

    function initializeIIDCounters(forEval) {
        var adj = forEval ? IID_INC_STEP / 2 : 0;
        condIid = IID_INC_STEP + adj + 0;
        memIid = IID_INC_STEP + adj + 1;
        opIid = IID_INC_STEP + adj + 2;
    }


    function instrumentEvalCode(code, iid, isDirect) {
        return instrumentCode({
            code: code,
            thisIid: iid,
            isEval: true,
            inlineSourceMap: true,
            inlineSource: true,
            isDirect: isDirect
        }).code;
    }

    function removeShebang(code) {
        if (code.indexOf("#!") == 0) {
            return code.substring(code.indexOf("\n") + 1);
        }
        return code;
    }

    /**
     * Instruments the provided code.
     *
     * @param {{isEval: boolean, code: string, thisIid: int, origCodeFileName: string, instCodeFileName: string, inlineSourceMap: boolean, inlineSource: boolean, url: string, isDirect: boolean }} options
     * @return {{code:string, instAST: object, sourceMapObject: object, sourceMapString: string}}
     *
     */
    function instrumentCode(options) {
        var aret, skip = false;
        var isEval = options.isEval,
            code = options.code, thisIid = options.thisIid, inlineSource = options.inlineSource, url = options.url;

        iidSourceInfo = {};
        initializeIIDCounters(isEval);
        instCodeFileName = options.instCodeFileName ? options.instCodeFileName : (options.isDirect?"eval":"evalIndirect");
        origCodeFileName = options.origCodeFileName ? options.origCodeFileName : (options.isDirect?"eval":"evalIndirect");


        if (sandbox.analysis && sandbox.analysis.instrumentCodePre) {
            aret = sandbox.analysis.instrumentCodePre(thisIid, code, options.isDirect);
            if (aret) {
                code = aret.code;
                skip = aret.skip;
            }
        }

        if (!skip && typeof code === 'string' && code.indexOf(noInstr) < 0) {
            try {
                code = removeShebang(code);
                iidSourceInfo = {};
                var newAst;
                if (Config.ENABLE_SAMPLING) {
                    newAst = transformString(code, [visitorCloneBodyPre, visitorRRPost, visitorOps, visitorMergeBodyPre], [undefined, visitorRRPre, undefined, undefined]);
                } else {
                    newAst = transformString(code, [visitorRRPost, visitorOps], [visitorRRPre, undefined]);
                }
                // post-process AST to hoist function declarations (required for Firefox)
                var hoistedFcts = [];
                newAst = hoistFunctionDeclaration(newAst, hoistedFcts);
                var newCode = esotope.generate(newAst, {comment: true ,parse: acorn.parse});
                code = newCode + "\n" + noInstr + "\n";
            } catch(ex) {
                console.log("Failed to instrument", code);
                throw ex;
            }
        }

        var tmp = {};

        tmp.nBranches = iidSourceInfo.nBranches = (condIid / IID_INC_STEP - 1) * 2;
        tmp.originalCodeFileName = iidSourceInfo.originalCodeFileName = origCodeFileName;
        tmp.instrumentedCodeFileName = iidSourceInfo.instrumentedCodeFileName = instCodeFileName;
        if (url) {
            tmp.url = iidSourceInfo.url = url;
        }
        if (isEval) {
            tmp.evalSid = iidSourceInfo.evalSid = sandbox.sid;
            tmp.evalIid = iidSourceInfo.evalIid = thisIid;
        }
        if (inlineSource) {
            tmp.code = iidSourceInfo.code = options.code;
        }

        var prepend = JSON.stringify(iidSourceInfo);
        var instCode;
        if (options.inlineSourceMap) {
            instCode = JALANGI_VAR + ".iids = " + prepend + ";\n" + code;
        } else {
            instCode = JALANGI_VAR + ".iids = " + JSON.stringify(tmp) + ";\n" + code;
        }

        if (isEval && sandbox.analysis && sandbox.analysis.instrumentCode) {
            aret = sandbox.analysis.instrumentCode(thisIid, instCode, newAst, options.isDirect);
            if (aret) {
                instCode = aret.result;
            }
        }

        return {code: instCode, instAST: newAst, sourceMapObject: iidSourceInfo, sourceMapString: prepend};

    }

    sandbox.instrumentCode = instrumentCode;
    sandbox.instrumentEvalCode = instrumentEvalCode;

}(J$));


// exports J$.instrumentCode
// exports J$.instrumentEvalCode
// depends on acorn
// depends on esotope
// depends on J$.Constants
// depends on J$.Config
// depends on J$.astUtil

/*
 * Copyright 2013-2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.iidToLocation !== 'undefined') {
        return;
    }
    sandbox.iidToLocation = function (sid, iid) {
        var ret, arr, gid=sid;
        if (sandbox.smap) {
            if (typeof sid === 'string' && sid.indexOf(':')>=0) {
                sid = sid.split(':');
                iid = parseInt(sid[1]);
                sid = parseInt(sid[0]);
            } else {
                gid = sid+":"+iid;
            }
            if ((ret = sandbox.smap[sid])) {
                var fname = ret.originalCodeFileName;
                if (ret.evalSid !== undefined) {
                    fname = fname+sandbox.iidToLocation(ret.evalSid, ret.evalIid);
                }
                arr = ret[iid];
                if (arr) {
                    if (sandbox.Results) {
                        return "<a href=\"javascript:iidToDisplayCodeLocation('"+gid+"');\">(" + fname + ":" + arr[0] + ":" + arr[1] + ":" + arr[2] + ":" + arr[3] + ")</a>";
                    } else {
                        return "(" + fname + ":" + arr[0] + ":" + arr[1] + ":" + arr[2] + ":" + arr[3] + ")";
                    }
                } else {
                    return "(" + fname + ":iid" + iid + ")";
                }
            }
        }
        return sid+"";
    };

    sandbox.getGlobalIID = function(iid) {
        return sandbox.sid +":"+iid;
    }

}(J$));

/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


// wrap in anonymous function to create local namespace when in browser
// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.B !== 'undefined') {
        return;
    }
    //----------------------------------- Begin Jalangi Library backend ---------------------------------

    // stack of return values from instrumented functions.
    // we need to keep a stack since a function may return and then
    // have another function call in a finally block (see test
    // call_in_finally.js)

    var global = this;
    var Function = global.Function;
    var returnStack = [];
    var wrappedExceptionVal;
    var lastVal;
    var switchLeft;
    var switchKeyStack = [];
    var argIndex;
    var EVAL_ORG = eval;
    var lastComputedValue;
    var SPECIAL_PROP_SID = sandbox.Constants.SPECIAL_PROP_SID;
    var SPECIAL_PROP_IID = sandbox.Constants.SPECIAL_PROP_IID;

    function getPropSafe(base, prop){
      if(base === null || base === undefined){
        return undefined;
      }
      return base[prop];
    }

    function decodeBitPattern(i, len) {
        var ret = new Array(len);
        for (var j=0; j<len; j++) {
            var val = (i & 1)?true:false;
            ret[len - j -1] = val;
            i = i >> 1;
        }
        return ret;
    }

    function createBitPattern() {
        var ret = 0;
        var i;
        for (i =0; i< arguments.length; i++) {
            ret = (ret << 1)+(arguments[i]?1:0);
        }
        return ret;
    }


    var sidStack = [], sidCounter = 0;

    function createAndAssignNewSid() {
        sidStack.push(sandbox.sid);
        sandbox.sid = sidCounter = sidCounter + 1;
        if (!sandbox.smap) sandbox.smap = {};
        sandbox.smap[sandbox.sid] = sandbox.iids;
    }

    function rollBackSid() {
        sandbox.sid = sidStack.pop();
    }

    function associateSidWithFunction(f, iid) {
        if (typeof f === 'function') {
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(f, SPECIAL_PROP_SID, {
                    enumerable:false,
                    writable:true
                });
                Object.defineProperty(f, SPECIAL_PROP_IID, {
                    enumerable:false,
                    writable:true
                });
            }
            f[SPECIAL_PROP_SID] = sandbox.sid;
            f[SPECIAL_PROP_IID] = iid;
        }
    }

    function updateSid(f) {
        sidStack.push(sandbox.sid);
        sandbox.sid = getPropSafe(f, SPECIAL_PROP_SID);
    }


    // unused
    function isNative(f) {
        return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
    }

    function callAsNativeConstructorWithEval(Constructor, args) {
        var a = [];
        for (var i = 0; i < args.length; i++)
            a[i] = 'args[' + i + ']';
        var eval = EVAL_ORG;
        return eval('new Constructor(' + a.join() + ')');
    }

    function callAsNativeConstructor(Constructor, args) {
        if (args.length === 0) {
            return new Constructor();
        }
        if (args.length === 1) {
            return new Constructor(args[0]);
        }
        if (args.length === 2) {
            return new Constructor(args[0], args[1]);
        }
        if (args.length === 3) {
            return new Constructor(args[0], args[1], args[2]);
        }
        if (args.length === 4) {
            return new Constructor(args[0], args[1], args[2], args[3]);
        }
        if (args.length === 5) {
            return new Constructor(args[0], args[1], args[2], args[3], args[4]);
        }
        return callAsNativeConstructorWithEval(Constructor, args);
    }

    function callAsConstructor(Constructor, args) {
        var ret;
        if (true) {
            ret = callAsNativeConstructor(Constructor, args);
            return ret;
        } else { // else branch is a more elegant to call a constructor reflectively, but it leads to memory leak in v8.
            var Temp = function () {
            }, inst;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }

    function invokeEval(base, f, args, iid) {
        return f(sandbox.instrumentEvalCode(args[0], iid, false));
    }

    function invokeFunctionDecl(base, f, args, iid) {
        // Invoke with the original parameters to preserve exceptional behavior if input is invalid
        f.apply(base, args);
        // Otherwise input is valid, so instrument and invoke via eval
        var newArgs = [];
        for (var i = 0; i < args.length-1; i++) {
            newArgs[i] = args[i];
        }
        var code = '(function(' + newArgs.join(', ') + ') { ' + args[args.length-1] + ' })';
        var code = sandbox.instrumentEvalCode(code, iid, false);
        // Using EVAL_ORG instead of eval() is important as it preserves the scoping semantics of Function()
        var out = EVAL_ORG(code);
        return out;
    }

    function callFun(f, base, args, isConstructor, iid) {
        var result;
        pushSwitchKey();
        try {
            if (f === EVAL_ORG) {
                result = invokeEval(base, f, args, iid);
            } else if (f === Function) {
                result = invokeFunctionDecl(base, f, args, iid);
            } else if (isConstructor) {
                result = callAsConstructor(f, args);
            } else {
                result = Function.prototype.apply.call(f, base, args);
            }
            return result;
        } finally {
            popSwitchKey();
        }
    }

    function invokeFun(iid, base, f, args, isConstructor, isMethod) {
        var aret, skip = false, result;

        if (sandbox.analysis && sandbox.analysis.invokeFunPre) {
            aret = sandbox.analysis.invokeFunPre(iid, f, base, args, isConstructor, isMethod, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
            if (aret) {
                f = aret.f;
                base = aret.base;
                args = aret.args;
                skip = aret.skip;
            }
        }
        if (!skip) {
            result = callFun(f, base, args, isConstructor, iid);
        }
        if (sandbox.analysis && sandbox.analysis.invokeFun) {
            aret = sandbox.analysis.invokeFun(iid, f, base, args, result, isConstructor, isMethod, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
            if (aret) {
                result = aret.result;
            }
        }
        return result;
    }

    // Function call (e.g., f())
    function F(iid, f, flags) {
        var bFlags = decodeBitPattern(flags, 1); // [isConstructor]
        return function () {
            var base = this;
            return (lastComputedValue = invokeFun(iid, base, f, arguments, bFlags[0], false));
        }
    }

    // Method call (e.g., e.f())
    function M(iid, base, offset, flags) {
        var bFlags = decodeBitPattern(flags, 2); // [isConstructor, isComputed]
        var f = G(iid + 2, base, offset, createBitPattern(bFlags[1], false, true));
        return function () {
            return (lastComputedValue = invokeFun(iid, base, f, arguments, bFlags[0], true));
        };
    }

    // Ignore argument (identity).
    function I(val) {
        return val;
    }

    var hasGetOwnPropertyDescriptor = typeof Object.getOwnPropertyDescriptor === 'function';
    // object/function/regexp/array Literal
    function T(iid, val, type, hasGetterSetter, internalIid) {
        var aret;
        associateSidWithFunction(val, internalIid);
        if (hasGetterSetter) {
            for (var offset in val) {
                if (hasGetOwnPropertyDescriptor && val.hasOwnProperty(offset)) {
                    var desc = Object.getOwnPropertyDescriptor(val, offset);
                    if (desc !== undefined) {
                        if (typeof desc.get === 'function') {
                            T(iid, desc.get, 12, false, internalIid);
                        }
                        if (typeof desc.set === 'function') {
                            T(iid, desc.set, 12, false, internalIid);
                        }
                    }
                }
            }
        }
        if (sandbox.analysis && sandbox.analysis.literal) {
            aret = sandbox.analysis.literal(iid, val, hasGetterSetter);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // wrap object o in for (x in o) { ... }
    function H(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.forinObject) {
            aret = sandbox.analysis.forinObject(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // variable declaration (Init)
    function N(iid, name, val, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isArgument, isLocalSync, isCatchParam]
        // isLocalSync is only true when we sync variables inside a for-in loop
        var aret;

        if (bFlags[0]) {
            argIndex++;
        }
        if (!bFlags[1] && sandbox.analysis && sandbox.analysis.declare) {
            if (bFlags[0] && argIndex > 1) {
                aret = sandbox.analysis.declare(iid, name, val, bFlags[0], argIndex - 2, bFlags[2]);
            } else {
                aret = sandbox.analysis.declare(iid, name, val, bFlags[0], -1, bFlags[2]);
            }
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // getField (property read)
    function G(iid, base, offset, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isComputed, isOpAssign, isMethodCall]

        var aret, skip = false, val;

        if (sandbox.analysis && sandbox.analysis.getFieldPre) {
            aret = sandbox.analysis.getFieldPre(iid, base, offset, bFlags[0], bFlags[1], bFlags[2]);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                skip = aret.skip;
            }
        }

        if (!skip) {
            val = base[offset];
        }
        if (sandbox.analysis && sandbox.analysis.getField) {
            aret = sandbox.analysis.getField(iid, base, offset, val, bFlags[0], bFlags[1], bFlags[2]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // putField (property write)
    function P(iid, base, offset, val, flags) {
        var bFlags = decodeBitPattern(flags, 2); // [isComputed, isOpAssign]

        var aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.putFieldPre) {
            aret = sandbox.analysis.putFieldPre(iid, base, offset, val, bFlags[0], !!bFlags[1]);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                val = aret.val;
                skip = aret.skip;
            }
        }

        if (!skip) {
            base[offset] = val;
        }
        if (sandbox.analysis && sandbox.analysis.putField) {
            aret = sandbox.analysis.putField(iid, base, offset, val, bFlags[0], !!bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // variable write
    // isGlobal means that the variable is global and not declared as var
    // isScriptLocal means that the variable is global and is declared as var
    function R(iid, name, val, flags) {
        var aret;
        var bFlags = decodeBitPattern(flags, 2); // [isGlobal, isScriptLocal]

        if (sandbox.analysis && sandbox.analysis.read) {
            aret = sandbox.analysis.read(iid, name, val, bFlags[0], bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // variable write
    function W(iid, name, val, lhs, flags) {
        var bFlags = decodeBitPattern(flags, 3); //[isGlobal, isScriptLocal, isDeclaration]
        var aret;
        if (sandbox.analysis && sandbox.analysis.write) {
            aret = sandbox.analysis.write(iid, name, val, lhs, bFlags[0], bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        if (!bFlags[2]) {
            return (lastComputedValue = val);
        } else {
            lastComputedValue = undefined;
            return val;
        }
    }

    // with statement
    function Wi(iid, val) {
        if (sandbox.analysis && sandbox.analysis._with) {
            aret = sandbox.analysis._with(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // Uncaught exception
    function Ex(iid, e) {
        wrappedExceptionVal = {exception:e};
    }

    // Throw statement
    function Th(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis._throw) {
            aret = sandbox.analysis._throw(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // Return statement
    function Rt(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis._return) {
            aret = sandbox.analysis._return(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        returnStack.pop();
        returnStack.push(val);
        return (lastComputedValue = val);
    }

    // Actual return from function, invoked from 'finally' block
    // added around every function by instrumentation.  Reads
    // the return value stored by call to Rt()
    function Ra() {
        var returnVal = returnStack.pop();
        wrappedExceptionVal = undefined;
        return returnVal;
    }

    // Function enter
    function Fe(iid, f, dis /* this */, args) {
        argIndex = 0;
        returnStack.push(undefined);
        wrappedExceptionVal = undefined;
        updateSid(f);
        if (sandbox.analysis && sandbox.analysis.functionEnter) {
            sandbox.analysis.functionEnter(iid, f, dis, args);
        }
    }

    // Function exit
    function Fr(iid) {
        var isBacktrack = false, tmp, aret, returnVal;

        returnVal = returnStack.pop();
        if (sandbox.analysis && sandbox.analysis.functionExit) {
            aret = sandbox.analysis.functionExit(iid, returnVal, wrappedExceptionVal);
            if (aret) {
                returnVal = aret.returnVal;
                wrappedExceptionVal = aret.wrappedExceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        rollBackSid();
        if (!isBacktrack) {
            returnStack.push(returnVal);
        }
        // if there was an uncaught exception, throw it
        // here, to preserve exceptional control flow
        if (wrappedExceptionVal !== undefined) {
            tmp = wrappedExceptionVal.exception;
            wrappedExceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }

    // Script enter
    function Se(iid, val, origFileName) {
        createAndAssignNewSid();
        if (sandbox.analysis && sandbox.analysis.scriptEnter) {
            sandbox.analysis.scriptEnter(iid, val, origFileName);
        }
        lastComputedValue = undefined;
    }

    // Script exit
    function Sr(iid) {
        var tmp, aret, isBacktrack;
        if (sandbox.analysis && sandbox.analysis.scriptExit) {
            aret = sandbox.analysis.scriptExit(iid, wrappedExceptionVal);
            if (aret) {
                wrappedExceptionVal = aret.wrappedExceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        rollBackSid();
        if (wrappedExceptionVal !== undefined) {
            tmp = wrappedExceptionVal.exception;
            wrappedExceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }


    // Modify and assign +=, -= ...
    function A(iid, base, offset, op, flags) {
        var bFlags = decodeBitPattern(flags, 1); // [isComputed]
        // avoid iid collision: make sure that iid+2 has the same source map as iid (@todo)
        var oprnd1 = G(iid+2, base, offset, createBitPattern(bFlags[0], true, false));
        return function (oprnd2) {
            // still possible to get iid collision with a mem operation
            var val = B(iid, op, oprnd1, oprnd2, createBitPattern(false, true, false));
            return P(iid, base, offset, val, createBitPattern(bFlags[0], true));
        };
    }

    // Binary operation
    function B(iid, op, left, right, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isComputed, isOpAssign, isSwitchCaseComparison]
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.binaryPre) {
            aret = sandbox.analysis.binaryPre(iid, op, left, right, bFlags[1], bFlags[2], bFlags[0]);
            if (aret) {
                op = aret.op;
                left = aret.left;
                right = aret.right;
                skip = aret.skip;
            }
        }


        if (!skip) {
            switch (op) {
                case "+":
                    result = left + right;
                    break;
                case "-":
                    result = left - right;
                    break;
                case "*":
                    result = left * right;
                    break;
                case "/":
                    result = left / right;
                    break;
                case "%":
                    result = left % right;
                    break;
                case "<<":
                    result = left << right;
                    break;
                case ">>":
                    result = left >> right;
                    break;
                case ">>>":
                    result = left >>> right;
                    break;
                case "<":
                    result = left < right;
                    break;
                case ">":
                    result = left > right;
                    break;
                case "<=":
                    result = left <= right;
                    break;
                case ">=":
                    result = left >= right;
                    break;
                case "==":
                    result = left == right;
                    break;
                case "!=":
                    result = left != right;
                    break;
                case "===":
                    result = left === right;
                    break;
                case "!==":
                    result = left !== right;
                    break;
                case "&":
                    result = left & right;
                    break;
                case "|":
                    result = left | right;
                    break;
                case "^":
                    result = left ^ right;
                    break;
                case "delete":
                    result = delete left[right];
                    break;
                case "instanceof":
                    result = left instanceof right;
                    break;
                case "in":
                    result = left in right;
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.binary) {
            aret = sandbox.analysis.binary(iid, op, left, right, result, bFlags[1], bFlags[2], bFlags[0]);
            if (aret) {
                result = aret.result;
            }
        }
        return (lastComputedValue = result);
    }


    // Unary operation
    function U(iid, op, left) {
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.unaryPre) {
            aret = sandbox.analysis.unaryPre(iid, op, left);
            if (aret) {
                op = aret.op;
                left = aret.left;
                skip = aret.skip
            }
        }

        if (!skip) {
            switch (op) {
                case "+":
                    result = +left;
                    break;
                case "-":
                    result = -left;
                    break;
                case "~":
                    result = ~left;
                    break;
                case "!":
                    result = !left;
                    break;
                case "typeof":
                    result = typeof left;
                    break;
                case "void":
                    result = void(left);
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.unary) {
            aret = sandbox.analysis.unary(iid, op, left, result);
            if (aret) {
                result = aret.result;
            }
        }
        return (lastComputedValue = result);
    }

    function pushSwitchKey() {
        switchKeyStack.push(switchLeft);
    }

    function popSwitchKey() {
        switchLeft = switchKeyStack.pop();
    }

    function last() {
        return (lastComputedValue = lastVal);
    }

    // Switch key
    // E.g., for 'switch (x) { ... }',
    // C1 is invoked with value of x
    function C1(iid, left) {
        switchLeft = left;
        return (lastComputedValue = left);
    }

    // case label inside switch
    function C2(iid, right) {
        var aret, result;

        // avoid iid collision; iid may not have a map in the sourcemap
        result = B(iid+1, "===", switchLeft, right, createBitPattern(false, false, true));

        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, result);
            if (aret) {
                if (result && !aret.result) {
                    right = !right;
                } else if (result && aret.result) {
                    right = switchLeft;
                }
            }
        }
        return (lastComputedValue = right);
    }

    // Expression in conditional
    function C(iid, left) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, left);
            if (aret) {
                left = aret.result;
            }
        }

        lastVal = left;
        return (lastComputedValue = left);
    }

    function S(iid, f) {
        if (sandbox.analysis && sandbox.analysis.runInstrumentedFunctionBody) {
            return sandbox.analysis.runInstrumentedFunctionBody(iid, f, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
        }
        return true;
    }

    function L() {
        return lastComputedValue;
    }


    function X1(iid, val) {
        if (sandbox.analysis && sandbox.analysis.endExpression) {
            sandbox.analysis.endExpression(iid);
        }

        return (lastComputedValue = val);
    }

    function endExecution() {
        if (sandbox.analysis && sandbox.analysis.endExecution) {
            return sandbox.analysis.endExecution();
        }
    }


    function log(str) {
        if (sandbox.Results && sandbox.Results.execute) {
            sandbox.Results.execute(function(div, jquery, editor){
                div.append(str+"<br>");
            });
        } else {
            console.log(str);
        }
    }


    //----------------------------------- End Jalangi Library backend ---------------------------------

    sandbox.U = U; // Unary operation
    sandbox.B = B; // Binary operation
    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
    sandbox._ = last;  // Last value passed to C

    sandbox.H = H; // hash in for-in
    sandbox.I = I; // Ignore argument
    sandbox.G = G; // getField
    sandbox.P = P; // putField
    sandbox.R = R; // Read
    sandbox.W = W; // Write
    sandbox.N = N; // Init
    sandbox.T = T; // object/function/regexp/array Literal
    sandbox.F = F; // Function call
    sandbox.M = M; // Method call
    sandbox.A = A; // Modify and assign +=, -= ...
    sandbox.Fe = Fe; // Function enter
    sandbox.Fr = Fr; // Function return
    sandbox.Se = Se; // Script enter
    sandbox.Sr = Sr; // Script return
    sandbox.Rt = Rt; // returned value
    sandbox.Th = Th; // thrown value
    sandbox.Ra = Ra;
    sandbox.Ex = Ex;
    sandbox.L = L;
    sandbox.X1 = X1; // top level expression
    sandbox.Wi = Wi; // with statement
    sandbox.endExecution = endExecution;

    sandbox.S = S;

    sandbox.EVAL_ORG = EVAL_ORG;
    sandbox.log = log;
})(J$);


