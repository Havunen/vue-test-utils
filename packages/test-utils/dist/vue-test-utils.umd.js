(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue'), require('vue-template-compiler')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue', 'vue-template-compiler'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueTestUtils = {}, global.Vue, global.VueTemplateCompiler));
})(this, (function (exports, Vue, vueTemplateCompiler) { 'use strict';

  // 


  function createVNodes(vm, slotValue, name) {
    const el = vueTemplateCompiler.compileToFunctions(
      `<div><template slot=${name}>${slotValue}</template></div>`
    );
    const _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
    const _staticTrees = vm._renderProxy._staticTrees;
    vm._renderProxy._staticTrees = [];
    vm._renderProxy.$options.staticRenderFns = el.staticRenderFns;
    const vnode = el.render.call(vm._renderProxy, vm.$createElement);
    vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
    vm._renderProxy._staticTrees = _staticTrees;
    return vnode.children[0]
  }

  function createVNodesForSlot(
    vm,
    slotValue,
    name
  ) {
    if (typeof slotValue === 'string') {
      return createVNodes(vm, slotValue, name)
    }
    const vnode = vm.$createElement(slotValue)
    ;(vnode.data || (vnode.data = {})).slot = name;
    return vnode
  }

  function createSlotVNodes(
    vm,
    slots
  ) {
    return Object.keys(slots).reduce((acc, key) => {
      const content = slots[key];
      if (Array.isArray(content)) {
        const nodes = content.map(slotDef =>
          createVNodesForSlot(vm, slotDef, key)
        );
        return acc.concat(nodes)
      }

      return acc.concat(createVNodesForSlot(vm, content, key))
    }, [])
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var re$2 = {exports: {}};

  // Note: this is the semver.org version of the spec that it implements
  // Not necessarily the package version of this code.
  const SEMVER_SPEC_VERSION = '2.0.0';

  const MAX_LENGTH$1 = 256;
  const MAX_SAFE_INTEGER$3 = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

  // Max safe segment length for coercion.
  const MAX_SAFE_COMPONENT_LENGTH = 16;

  // Max safe length for a build identifier. The max length minus 6 characters for
  // the shortest version with a build 0.0.0+BUILD.
  const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;

  const RELEASE_TYPES = [
    'major',
    'premajor',
    'minor',
    'preminor',
    'patch',
    'prepatch',
    'prerelease',
  ];

  var constants$1 = {
    MAX_LENGTH: MAX_LENGTH$1,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$3,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 0b001,
    FLAG_LOOSE: 0b010,
  };

  const debug$1 = (
    typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)
  ) ? (...args) => console.error('SEMVER', ...args)
    : () => {};

  var debug_1 = debug$1;

  (function (module, exports) {
  	const {
  	  MAX_SAFE_COMPONENT_LENGTH,
  	  MAX_SAFE_BUILD_LENGTH,
  	  MAX_LENGTH,
  	} = constants$1;
  	const debug = debug_1;
  	exports = module.exports = {};

  	// The actual regexps go on exports.re
  	const re = exports.re = [];
  	const safeRe = exports.safeRe = [];
  	const src = exports.src = [];
  	const t = exports.t = {};
  	let R = 0;

  	const LETTERDASHNUMBER = '[a-zA-Z0-9-]';

  	// Replace some greedy regex tokens to prevent regex dos issues. These regex are
  	// used internally via the safeRe object since all inputs in this library get
  	// normalized first to trim and collapse all extra whitespace. The original
  	// regexes are exported for userland consumption and lower level usage. A
  	// future breaking change could export the safer regex only with a note that
  	// all input should have extra whitespace removed.
  	const safeRegexReplacements = [
  	  ['\\s', 1],
  	  ['\\d', MAX_LENGTH],
  	  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
  	];

  	const makeSafeRegex = (value) => {
  	  for (const [token, max] of safeRegexReplacements) {
  	    value = value
  	      .split(`${token}*`).join(`${token}{0,${max}}`)
  	      .split(`${token}+`).join(`${token}{1,${max}}`);
  	  }
  	  return value
  	};

  	const createToken = (name, value, isGlobal) => {
  	  const safe = makeSafeRegex(value);
  	  const index = R++;
  	  debug(name, index, value);
  	  t[name] = index;
  	  src[index] = value;
  	  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
  	  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
  	};

  	// The following Regular Expressions can be used for tokenizing,
  	// validating, and parsing SemVer version strings.

  	// ## Numeric Identifier
  	// A single `0`, or a non-zero digit followed by zero or more digits.

  	createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
  	createToken('NUMERICIDENTIFIERLOOSE', '\\d+');

  	// ## Non-numeric Identifier
  	// Zero or more digits, followed by a letter or hyphen, and then zero or
  	// more letters, digits, or hyphens.

  	createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);

  	// ## Main Version
  	// Three dot-separated numeric identifiers.

  	createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
  	                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
  	                   `(${src[t.NUMERICIDENTIFIER]})`);

  	createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
  	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
  	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

  	// ## Pre-release Version Identifier
  	// A numeric identifier, or a non-numeric identifier.

  	createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

  	createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

  	// ## Pre-release Version
  	// Hyphen, followed by one or more dot-separated pre-release version
  	// identifiers.

  	createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
	}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

  	createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
	}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

  	// ## Build Metadata Identifier
  	// Any combination of digits, letters, or hyphens.

  	createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);

  	// ## Build Metadata
  	// Plus sign, followed by one or more period-separated build metadata
  	// identifiers.

  	createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
	}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

  	// ## Full Version String
  	// A main version, followed optionally by a pre-release version and
  	// build metadata.

  	// Note that the only major, minor, patch, and pre-release sections of
  	// the version string are capturing groups.  The build metadata is not a
  	// capturing group, because it should not ever be used in version
  	// comparison.

  	createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
	}${src[t.PRERELEASE]}?${
	  src[t.BUILD]}?`);

  	createToken('FULL', `^${src[t.FULLPLAIN]}$`);

  	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
  	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
  	// common in the npm registry.
  	createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
	}${src[t.PRERELEASELOOSE]}?${
	  src[t.BUILD]}?`);

  	createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

  	createToken('GTLT', '((?:<|>)?=?)');

  	// Something like "2.*" or "1.2.x".
  	// Note that "x.x" is a valid xRange identifer, meaning "any version"
  	// Only the first item is strictly required.
  	createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  	createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

  	createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
  	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
  	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
  	                   `(?:${src[t.PRERELEASE]})?${
	                     src[t.BUILD]}?` +
  	                   `)?)?`);

  	createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
  	                        `(?:${src[t.PRERELEASELOOSE]})?${
	                          src[t.BUILD]}?` +
  	                        `)?)?`);

  	createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  	createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

  	// Coercion.
  	// Extract anything that could conceivably be a part of a valid semver
  	createToken('COERCE', `${'(^|[^\\d])' +
	              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
  	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
  	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
  	              `(?:$|[^\\d])`);
  	createToken('COERCERTL', src[t.COERCE], true);

  	// Tilde ranges.
  	// Meaning is "reasonably at or greater than"
  	createToken('LONETILDE', '(?:~>?)');

  	createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  	exports.tildeTrimReplace = '$1~';

  	createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  	createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

  	// Caret ranges.
  	// Meaning is "at least and backwards compatible with"
  	createToken('LONECARET', '(?:\\^)');

  	createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
  	exports.caretTrimReplace = '$1^';

  	createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  	createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

  	// A simple gt/lt/eq thing, or just "" to indicate "any version"
  	createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  	createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

  	// An expression to strip any whitespace between the gtlt and the thing
  	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
  	createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
	}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  	exports.comparatorTrimReplace = '$1$2$3';

  	// Something like `1.2.3 - 1.2.4`
  	// Note that these all use the loose form, because they'll be
  	// checked against either the strict or loose comparator form
  	// later.
  	createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
  	                   `\\s+-\\s+` +
  	                   `(${src[t.XRANGEPLAIN]})` +
  	                   `\\s*$`);

  	createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
  	                        `\\s+-\\s+` +
  	                        `(${src[t.XRANGEPLAINLOOSE]})` +
  	                        `\\s*$`);

  	// Star ranges basically just allow anything at all.
  	createToken('STAR', '(<|>)?=?\\s*\\*');
  	// >=0.0.0 is like a star
  	createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
  	createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
  } (re$2, re$2.exports));

  var reExports = re$2.exports;

  // parse out just the options we care about
  const looseOption = Object.freeze({ loose: true });
  const emptyOpts = Object.freeze({ });
  const parseOptions$1 = options => {
    if (!options) {
      return emptyOpts
    }

    if (typeof options !== 'object') {
      return looseOption
    }

    return options
  };
  var parseOptions_1 = parseOptions$1;

  const numeric = /^[0-9]+$/;
  const compareIdentifiers$1 = (a, b) => {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);

    if (anum && bnum) {
      a = +a;
      b = +b;
    }

    return a === b ? 0
      : (anum && !bnum) ? -1
      : (bnum && !anum) ? 1
      : a < b ? -1
      : 1
  };

  const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);

  var identifiers$1 = {
    compareIdentifiers: compareIdentifiers$1,
    rcompareIdentifiers,
  };

  const debug = debug_1;
  const { MAX_LENGTH, MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$2 } = constants$1;
  const { safeRe: re$1, t: t$1 } = reExports;

  const parseOptions = parseOptions_1;
  const { compareIdentifiers } = identifiers$1;
  let SemVer$d = class SemVer {
    constructor (version, options) {
      options = parseOptions(options);

      if (version instanceof SemVer) {
        if (version.loose === !!options.loose &&
            version.includePrerelease === !!options.includePrerelease) {
          return version
        } else {
          version = version.version;
        }
      } else if (typeof version !== 'string') {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
      }

      if (version.length > MAX_LENGTH) {
        throw new TypeError(
          `version is longer than ${MAX_LENGTH} characters`
        )
      }

      debug('SemVer', version, options);
      this.options = options;
      this.loose = !!options.loose;
      // this isn't actually relevant for versions, but keep it so that we
      // don't run into trouble passing this.options around.
      this.includePrerelease = !!options.includePrerelease;

      const m = version.trim().match(options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);

      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`)
      }

      this.raw = version;

      // these are actually numbers
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];

      if (this.major > MAX_SAFE_INTEGER$2 || this.major < 0) {
        throw new TypeError('Invalid major version')
      }

      if (this.minor > MAX_SAFE_INTEGER$2 || this.minor < 0) {
        throw new TypeError('Invalid minor version')
      }

      if (this.patch > MAX_SAFE_INTEGER$2 || this.patch < 0) {
        throw new TypeError('Invalid patch version')
      }

      // numberify any prerelease numeric ids
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split('.').map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER$2) {
              return num
            }
          }
          return id
        });
      }

      this.build = m[5] ? m[5].split('.') : [];
      this.format();
    }

    format () {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join('.')}`;
      }
      return this.version
    }

    toString () {
      return this.version
    }

    compare (other) {
      debug('SemVer.compare', this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === 'string' && other === this.version) {
          return 0
        }
        other = new SemVer(other, this.options);
      }

      if (other.version === this.version) {
        return 0
      }

      return this.compareMain(other) || this.comparePre(other)
    }

    compareMain (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }

      return (
        compareIdentifiers(this.major, other.major) ||
        compareIdentifiers(this.minor, other.minor) ||
        compareIdentifiers(this.patch, other.patch)
      )
    }

    comparePre (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }

      // NOT having a prerelease is > having one
      if (this.prerelease.length && !other.prerelease.length) {
        return -1
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0
      }

      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug('prerelease compare', i, a, b);
        if (a === undefined && b === undefined) {
          return 0
        } else if (b === undefined) {
          return 1
        } else if (a === undefined) {
          return -1
        } else if (a === b) {
          continue
        } else {
          return compareIdentifiers(a, b)
        }
      } while (++i)
    }

    compareBuild (other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }

      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug('prerelease compare', i, a, b);
        if (a === undefined && b === undefined) {
          return 0
        } else if (b === undefined) {
          return 1
        } else if (a === undefined) {
          return -1
        } else if (a === b) {
          continue
        } else {
          return compareIdentifiers(a, b)
        }
      } while (++i)
    }

    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc (release, identifier, identifierBase) {
      switch (release) {
        case 'premajor':
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc('pre', identifier, identifierBase);
          break
        case 'preminor':
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc('pre', identifier, identifierBase);
          break
        case 'prepatch':
          // If this is already a prerelease, it will bump to the next version
          // drop any prereleases that might already exist, since they are not
          // relevant at this point.
          this.prerelease.length = 0;
          this.inc('patch', identifier, identifierBase);
          this.inc('pre', identifier, identifierBase);
          break
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case 'prerelease':
          if (this.prerelease.length === 0) {
            this.inc('patch', identifier, identifierBase);
          }
          this.inc('pre', identifier, identifierBase);
          break

        case 'major':
          // If this is a pre-major version, bump up to the same major version.
          // Otherwise increment major.
          // 1.0.0-5 bumps to 1.0.0
          // 1.1.0 bumps to 2.0.0
          if (
            this.minor !== 0 ||
            this.patch !== 0 ||
            this.prerelease.length === 0
          ) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break
        case 'minor':
          // If this is a pre-minor version, bump up to the same minor version.
          // Otherwise increment minor.
          // 1.2.0-5 bumps to 1.2.0
          // 1.2.1 bumps to 1.3.0
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break
        case 'patch':
          // If this is not a pre-release version, it will increment the patch.
          // If it is a pre-release it will bump up to the same patch version.
          // 1.2.0-5 patches to 1.2.0
          // 1.2.0 patches to 1.2.1
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case 'pre': {
          const base = Number(identifierBase) ? 1 : 0;

          if (!identifier && identifierBase === false) {
            throw new Error('invalid increment argument: identifier is empty')
          }

          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === 'number') {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              // didn't increment anything
              if (identifier === this.prerelease.join('.') && identifierBase === false) {
                throw new Error('invalid increment argument: identifier already exists')
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
            // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break
        }
        default:
          throw new Error(`invalid increment argument: ${release}`)
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join('.')}`;
      }
      return this
    }
  };

  var semver$2 = SemVer$d;

  const SemVer$c = semver$2;
  const parse$6 = (version, options, throwErrors = false) => {
    if (version instanceof SemVer$c) {
      return version
    }
    try {
      return new SemVer$c(version, options)
    } catch (er) {
      if (!throwErrors) {
        return null
      }
      throw er
    }
  };

  var parse_1 = parse$6;

  const parse$5 = parse_1;
  const valid$2 = (version, options) => {
    const v = parse$5(version, options);
    return v ? v.version : null
  };
  var valid_1 = valid$2;

  const parse$4 = parse_1;
  const clean$1 = (version, options) => {
    const s = parse$4(version.trim().replace(/^[=v]+/, ''), options);
    return s ? s.version : null
  };
  var clean_1 = clean$1;

  const SemVer$b = semver$2;

  const inc$1 = (version, release, options, identifier, identifierBase) => {
    if (typeof (options) === 'string') {
      identifierBase = identifier;
      identifier = options;
      options = undefined;
    }

    try {
      return new SemVer$b(
        version instanceof SemVer$b ? version.version : version,
        options
      ).inc(release, identifier, identifierBase).version
    } catch (er) {
      return null
    }
  };
  var inc_1 = inc$1;

  const parse$3 = parse_1;

  const diff$1 = (version1, version2) => {
    const v1 = parse$3(version1, null, true);
    const v2 = parse$3(version2, null, true);
    const comparison = v1.compare(v2);

    if (comparison === 0) {
      return null
    }

    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;

    if (lowHasPre && !highHasPre) {
      // Going from prerelease -> no prerelease requires some special casing

      // If the low version has only a major, then it will always be a major
      // Some examples:
      // 1.0.0-1 -> 1.0.0
      // 1.0.0-1 -> 1.1.1
      // 1.0.0-1 -> 2.0.0
      if (!lowVersion.patch && !lowVersion.minor) {
        return 'major'
      }

      // Otherwise it can be determined by checking the high version

      if (highVersion.patch) {
        // anything higher than a patch bump would result in the wrong version
        return 'patch'
      }

      if (highVersion.minor) {
        // anything higher than a minor bump would result in the wrong version
        return 'minor'
      }

      // bumping major/minor/patch all have same result
      return 'major'
    }

    // add the `pre` prefix if we are going to a prerelease version
    const prefix = highHasPre ? 'pre' : '';

    if (v1.major !== v2.major) {
      return prefix + 'major'
    }

    if (v1.minor !== v2.minor) {
      return prefix + 'minor'
    }

    if (v1.patch !== v2.patch) {
      return prefix + 'patch'
    }

    // high and low are preleases
    return 'prerelease'
  };

  var diff_1 = diff$1;

  const SemVer$a = semver$2;
  const major$1 = (a, loose) => new SemVer$a(a, loose).major;
  var major_1 = major$1;

  const SemVer$9 = semver$2;
  const minor$1 = (a, loose) => new SemVer$9(a, loose).minor;
  var minor_1 = minor$1;

  const SemVer$8 = semver$2;
  const patch$1 = (a, loose) => new SemVer$8(a, loose).patch;
  var patch_1 = patch$1;

  const parse$2 = parse_1;
  const prerelease$1 = (version, options) => {
    const parsed = parse$2(version, options);
    return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
  };
  var prerelease_1 = prerelease$1;

  const SemVer$7 = semver$2;
  const compare$b = (a, b, loose) =>
    new SemVer$7(a, loose).compare(new SemVer$7(b, loose));

  var compare_1 = compare$b;

  const compare$a = compare_1;
  const rcompare$1 = (a, b, loose) => compare$a(b, a, loose);
  var rcompare_1 = rcompare$1;

  const compare$9 = compare_1;
  const compareLoose$1 = (a, b) => compare$9(a, b, true);
  var compareLoose_1 = compareLoose$1;

  const SemVer$6 = semver$2;
  const compareBuild$3 = (a, b, loose) => {
    const versionA = new SemVer$6(a, loose);
    const versionB = new SemVer$6(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB)
  };
  var compareBuild_1 = compareBuild$3;

  const compareBuild$2 = compareBuild_1;
  const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
  var sort_1 = sort$1;

  const compareBuild$1 = compareBuild_1;
  const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
  var rsort_1 = rsort$1;

  const compare$8 = compare_1;
  const gt$4 = (a, b, loose) => compare$8(a, b, loose) > 0;
  var gt_1 = gt$4;

  const compare$7 = compare_1;
  const lt$3 = (a, b, loose) => compare$7(a, b, loose) < 0;
  var lt_1 = lt$3;

  const compare$6 = compare_1;
  const eq$5 = (a, b, loose) => compare$6(a, b, loose) === 0;
  var eq_1$1 = eq$5;

  const compare$5 = compare_1;
  const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
  var neq_1 = neq$2;

  const compare$4 = compare_1;
  const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
  var gte_1 = gte$3;

  const compare$3 = compare_1;
  const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
  var lte_1 = lte$3;

  const eq$4 = eq_1$1;
  const neq$1 = neq_1;
  const gt$3 = gt_1;
  const gte$2 = gte_1;
  const lt$2 = lt_1;
  const lte$2 = lte_1;

  const cmp$1 = (a, op, b, loose) => {
    switch (op) {
      case '===':
        if (typeof a === 'object') {
          a = a.version;
        }
        if (typeof b === 'object') {
          b = b.version;
        }
        return a === b

      case '!==':
        if (typeof a === 'object') {
          a = a.version;
        }
        if (typeof b === 'object') {
          b = b.version;
        }
        return a !== b

      case '':
      case '=':
      case '==':
        return eq$4(a, b, loose)

      case '!=':
        return neq$1(a, b, loose)

      case '>':
        return gt$3(a, b, loose)

      case '>=':
        return gte$2(a, b, loose)

      case '<':
        return lt$2(a, b, loose)

      case '<=':
        return lte$2(a, b, loose)

      default:
        throw new TypeError(`Invalid operator: ${op}`)
    }
  };
  var cmp_1 = cmp$1;

  const SemVer$5 = semver$2;
  const parse$1 = parse_1;
  const { safeRe: re, t } = reExports;

  const coerce$1 = (version, options) => {
    if (version instanceof SemVer$5) {
      return version
    }

    if (typeof version === 'number') {
      version = String(version);
    }

    if (typeof version !== 'string') {
      return null
    }

    options = options || {};

    let match = null;
    if (!options.rtl) {
      match = version.match(re[t.COERCE]);
    } else {
      // Find the right-most coercible string that does not share
      // a terminus with a more left-ward coercible string.
      // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
      //
      // Walk through the string checking with a /g regexp
      // Manually set the index so as to pick up overlapping matches.
      // Stop when we get a match that ends at the string end, since no
      // coercible string can be more right-ward without the same terminus.
      let next;
      while ((next = re[t.COERCERTL].exec(version)) &&
          (!match || match.index + match[0].length !== version.length)
      ) {
        if (!match ||
              next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
      }
      // leave it in a clean state
      re[t.COERCERTL].lastIndex = -1;
    }

    if (match === null) {
      return null
    }

    return parse$1(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
  };
  var coerce_1 = coerce$1;

  var iterator;
  var hasRequiredIterator;

  function requireIterator () {
  	if (hasRequiredIterator) return iterator;
  	hasRequiredIterator = 1;
  	iterator = function (Yallist) {
  	  Yallist.prototype[Symbol.iterator] = function* () {
  	    for (let walker = this.head; walker; walker = walker.next) {
  	      yield walker.value;
  	    }
  	  };
  	};
  	return iterator;
  }

  var yallist;
  var hasRequiredYallist;

  function requireYallist () {
  	if (hasRequiredYallist) return yallist;
  	hasRequiredYallist = 1;
  	yallist = Yallist;

  	Yallist.Node = Node;
  	Yallist.create = Yallist;

  	function Yallist (list) {
  	  var self = this;
  	  if (!(self instanceof Yallist)) {
  	    self = new Yallist();
  	  }

  	  self.tail = null;
  	  self.head = null;
  	  self.length = 0;

  	  if (list && typeof list.forEach === 'function') {
  	    list.forEach(function (item) {
  	      self.push(item);
  	    });
  	  } else if (arguments.length > 0) {
  	    for (var i = 0, l = arguments.length; i < l; i++) {
  	      self.push(arguments[i]);
  	    }
  	  }

  	  return self
  	}

  	Yallist.prototype.removeNode = function (node) {
  	  if (node.list !== this) {
  	    throw new Error('removing node which does not belong to this list')
  	  }

  	  var next = node.next;
  	  var prev = node.prev;

  	  if (next) {
  	    next.prev = prev;
  	  }

  	  if (prev) {
  	    prev.next = next;
  	  }

  	  if (node === this.head) {
  	    this.head = next;
  	  }
  	  if (node === this.tail) {
  	    this.tail = prev;
  	  }

  	  node.list.length--;
  	  node.next = null;
  	  node.prev = null;
  	  node.list = null;

  	  return next
  	};

  	Yallist.prototype.unshiftNode = function (node) {
  	  if (node === this.head) {
  	    return
  	  }

  	  if (node.list) {
  	    node.list.removeNode(node);
  	  }

  	  var head = this.head;
  	  node.list = this;
  	  node.next = head;
  	  if (head) {
  	    head.prev = node;
  	  }

  	  this.head = node;
  	  if (!this.tail) {
  	    this.tail = node;
  	  }
  	  this.length++;
  	};

  	Yallist.prototype.pushNode = function (node) {
  	  if (node === this.tail) {
  	    return
  	  }

  	  if (node.list) {
  	    node.list.removeNode(node);
  	  }

  	  var tail = this.tail;
  	  node.list = this;
  	  node.prev = tail;
  	  if (tail) {
  	    tail.next = node;
  	  }

  	  this.tail = node;
  	  if (!this.head) {
  	    this.head = node;
  	  }
  	  this.length++;
  	};

  	Yallist.prototype.push = function () {
  	  for (var i = 0, l = arguments.length; i < l; i++) {
  	    push(this, arguments[i]);
  	  }
  	  return this.length
  	};

  	Yallist.prototype.unshift = function () {
  	  for (var i = 0, l = arguments.length; i < l; i++) {
  	    unshift(this, arguments[i]);
  	  }
  	  return this.length
  	};

  	Yallist.prototype.pop = function () {
  	  if (!this.tail) {
  	    return undefined
  	  }

  	  var res = this.tail.value;
  	  this.tail = this.tail.prev;
  	  if (this.tail) {
  	    this.tail.next = null;
  	  } else {
  	    this.head = null;
  	  }
  	  this.length--;
  	  return res
  	};

  	Yallist.prototype.shift = function () {
  	  if (!this.head) {
  	    return undefined
  	  }

  	  var res = this.head.value;
  	  this.head = this.head.next;
  	  if (this.head) {
  	    this.head.prev = null;
  	  } else {
  	    this.tail = null;
  	  }
  	  this.length--;
  	  return res
  	};

  	Yallist.prototype.forEach = function (fn, thisp) {
  	  thisp = thisp || this;
  	  for (var walker = this.head, i = 0; walker !== null; i++) {
  	    fn.call(thisp, walker.value, i, this);
  	    walker = walker.next;
  	  }
  	};

  	Yallist.prototype.forEachReverse = function (fn, thisp) {
  	  thisp = thisp || this;
  	  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
  	    fn.call(thisp, walker.value, i, this);
  	    walker = walker.prev;
  	  }
  	};

  	Yallist.prototype.get = function (n) {
  	  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
  	    // abort out of the list early if we hit a cycle
  	    walker = walker.next;
  	  }
  	  if (i === n && walker !== null) {
  	    return walker.value
  	  }
  	};

  	Yallist.prototype.getReverse = function (n) {
  	  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
  	    // abort out of the list early if we hit a cycle
  	    walker = walker.prev;
  	  }
  	  if (i === n && walker !== null) {
  	    return walker.value
  	  }
  	};

  	Yallist.prototype.map = function (fn, thisp) {
  	  thisp = thisp || this;
  	  var res = new Yallist();
  	  for (var walker = this.head; walker !== null;) {
  	    res.push(fn.call(thisp, walker.value, this));
  	    walker = walker.next;
  	  }
  	  return res
  	};

  	Yallist.prototype.mapReverse = function (fn, thisp) {
  	  thisp = thisp || this;
  	  var res = new Yallist();
  	  for (var walker = this.tail; walker !== null;) {
  	    res.push(fn.call(thisp, walker.value, this));
  	    walker = walker.prev;
  	  }
  	  return res
  	};

  	Yallist.prototype.reduce = function (fn, initial) {
  	  var acc;
  	  var walker = this.head;
  	  if (arguments.length > 1) {
  	    acc = initial;
  	  } else if (this.head) {
  	    walker = this.head.next;
  	    acc = this.head.value;
  	  } else {
  	    throw new TypeError('Reduce of empty list with no initial value')
  	  }

  	  for (var i = 0; walker !== null; i++) {
  	    acc = fn(acc, walker.value, i);
  	    walker = walker.next;
  	  }

  	  return acc
  	};

  	Yallist.prototype.reduceReverse = function (fn, initial) {
  	  var acc;
  	  var walker = this.tail;
  	  if (arguments.length > 1) {
  	    acc = initial;
  	  } else if (this.tail) {
  	    walker = this.tail.prev;
  	    acc = this.tail.value;
  	  } else {
  	    throw new TypeError('Reduce of empty list with no initial value')
  	  }

  	  for (var i = this.length - 1; walker !== null; i--) {
  	    acc = fn(acc, walker.value, i);
  	    walker = walker.prev;
  	  }

  	  return acc
  	};

  	Yallist.prototype.toArray = function () {
  	  var arr = new Array(this.length);
  	  for (var i = 0, walker = this.head; walker !== null; i++) {
  	    arr[i] = walker.value;
  	    walker = walker.next;
  	  }
  	  return arr
  	};

  	Yallist.prototype.toArrayReverse = function () {
  	  var arr = new Array(this.length);
  	  for (var i = 0, walker = this.tail; walker !== null; i++) {
  	    arr[i] = walker.value;
  	    walker = walker.prev;
  	  }
  	  return arr
  	};

  	Yallist.prototype.slice = function (from, to) {
  	  to = to || this.length;
  	  if (to < 0) {
  	    to += this.length;
  	  }
  	  from = from || 0;
  	  if (from < 0) {
  	    from += this.length;
  	  }
  	  var ret = new Yallist();
  	  if (to < from || to < 0) {
  	    return ret
  	  }
  	  if (from < 0) {
  	    from = 0;
  	  }
  	  if (to > this.length) {
  	    to = this.length;
  	  }
  	  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
  	    walker = walker.next;
  	  }
  	  for (; walker !== null && i < to; i++, walker = walker.next) {
  	    ret.push(walker.value);
  	  }
  	  return ret
  	};

  	Yallist.prototype.sliceReverse = function (from, to) {
  	  to = to || this.length;
  	  if (to < 0) {
  	    to += this.length;
  	  }
  	  from = from || 0;
  	  if (from < 0) {
  	    from += this.length;
  	  }
  	  var ret = new Yallist();
  	  if (to < from || to < 0) {
  	    return ret
  	  }
  	  if (from < 0) {
  	    from = 0;
  	  }
  	  if (to > this.length) {
  	    to = this.length;
  	  }
  	  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
  	    walker = walker.prev;
  	  }
  	  for (; walker !== null && i > from; i--, walker = walker.prev) {
  	    ret.push(walker.value);
  	  }
  	  return ret
  	};

  	Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  	  if (start > this.length) {
  	    start = this.length - 1;
  	  }
  	  if (start < 0) {
  	    start = this.length + start;
  	  }

  	  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
  	    walker = walker.next;
  	  }

  	  var ret = [];
  	  for (var i = 0; walker && i < deleteCount; i++) {
  	    ret.push(walker.value);
  	    walker = this.removeNode(walker);
  	  }
  	  if (walker === null) {
  	    walker = this.tail;
  	  }

  	  if (walker !== this.head && walker !== this.tail) {
  	    walker = walker.prev;
  	  }

  	  for (var i = 0; i < nodes.length; i++) {
  	    walker = insert(this, walker, nodes[i]);
  	  }
  	  return ret;
  	};

  	Yallist.prototype.reverse = function () {
  	  var head = this.head;
  	  var tail = this.tail;
  	  for (var walker = head; walker !== null; walker = walker.prev) {
  	    var p = walker.prev;
  	    walker.prev = walker.next;
  	    walker.next = p;
  	  }
  	  this.head = tail;
  	  this.tail = head;
  	  return this
  	};

  	function insert (self, node, value) {
  	  var inserted = node === self.head ?
  	    new Node(value, null, node, self) :
  	    new Node(value, node, node.next, self);

  	  if (inserted.next === null) {
  	    self.tail = inserted;
  	  }
  	  if (inserted.prev === null) {
  	    self.head = inserted;
  	  }

  	  self.length++;

  	  return inserted
  	}

  	function push (self, item) {
  	  self.tail = new Node(item, self.tail, null, self);
  	  if (!self.head) {
  	    self.head = self.tail;
  	  }
  	  self.length++;
  	}

  	function unshift (self, item) {
  	  self.head = new Node(item, null, self.head, self);
  	  if (!self.tail) {
  	    self.tail = self.head;
  	  }
  	  self.length++;
  	}

  	function Node (value, prev, next, list) {
  	  if (!(this instanceof Node)) {
  	    return new Node(value, prev, next, list)
  	  }

  	  this.list = list;
  	  this.value = value;

  	  if (prev) {
  	    prev.next = this;
  	    this.prev = prev;
  	  } else {
  	    this.prev = null;
  	  }

  	  if (next) {
  	    next.prev = this;
  	    this.next = next;
  	  } else {
  	    this.next = null;
  	  }
  	}

  	try {
  	  // add if support for Symbol.iterator is present
  	  requireIterator()(Yallist);
  	} catch (er) {}
  	return yallist;
  }

  var lruCache;
  var hasRequiredLruCache;

  function requireLruCache () {
  	if (hasRequiredLruCache) return lruCache;
  	hasRequiredLruCache = 1;

  	// A linked list to keep track of recently-used-ness
  	const Yallist = requireYallist();

  	const MAX = Symbol('max');
  	const LENGTH = Symbol('length');
  	const LENGTH_CALCULATOR = Symbol('lengthCalculator');
  	const ALLOW_STALE = Symbol('allowStale');
  	const MAX_AGE = Symbol('maxAge');
  	const DISPOSE = Symbol('dispose');
  	const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
  	const LRU_LIST = Symbol('lruList');
  	const CACHE = Symbol('cache');
  	const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

  	const naiveLength = () => 1;

  	// lruList is a yallist where the head is the youngest
  	// item, and the tail is the oldest.  the list contains the Hit
  	// objects as the entries.
  	// Each Hit object has a reference to its Yallist.Node.  This
  	// never changes.
  	//
  	// cache is a Map (or PseudoMap) that matches the keys to
  	// the Yallist.Node object.
  	class LRUCache {
  	  constructor (options) {
  	    if (typeof options === 'number')
  	      options = { max: options };

  	    if (!options)
  	      options = {};

  	    if (options.max && (typeof options.max !== 'number' || options.max < 0))
  	      throw new TypeError('max must be a non-negative number')
  	    // Kind of weird to have a default max of Infinity, but oh well.
  	    this[MAX] = options.max || Infinity;

  	    const lc = options.length || naiveLength;
  	    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
  	    this[ALLOW_STALE] = options.stale || false;
  	    if (options.maxAge && typeof options.maxAge !== 'number')
  	      throw new TypeError('maxAge must be a number')
  	    this[MAX_AGE] = options.maxAge || 0;
  	    this[DISPOSE] = options.dispose;
  	    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
  	    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
  	    this.reset();
  	  }

  	  // resize the cache when the max changes.
  	  set max (mL) {
  	    if (typeof mL !== 'number' || mL < 0)
  	      throw new TypeError('max must be a non-negative number')

  	    this[MAX] = mL || Infinity;
  	    trim(this);
  	  }
  	  get max () {
  	    return this[MAX]
  	  }

  	  set allowStale (allowStale) {
  	    this[ALLOW_STALE] = !!allowStale;
  	  }
  	  get allowStale () {
  	    return this[ALLOW_STALE]
  	  }

  	  set maxAge (mA) {
  	    if (typeof mA !== 'number')
  	      throw new TypeError('maxAge must be a non-negative number')

  	    this[MAX_AGE] = mA;
  	    trim(this);
  	  }
  	  get maxAge () {
  	    return this[MAX_AGE]
  	  }

  	  // resize the cache when the lengthCalculator changes.
  	  set lengthCalculator (lC) {
  	    if (typeof lC !== 'function')
  	      lC = naiveLength;

  	    if (lC !== this[LENGTH_CALCULATOR]) {
  	      this[LENGTH_CALCULATOR] = lC;
  	      this[LENGTH] = 0;
  	      this[LRU_LIST].forEach(hit => {
  	        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
  	        this[LENGTH] += hit.length;
  	      });
  	    }
  	    trim(this);
  	  }
  	  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  	  get length () { return this[LENGTH] }
  	  get itemCount () { return this[LRU_LIST].length }

  	  rforEach (fn, thisp) {
  	    thisp = thisp || this;
  	    for (let walker = this[LRU_LIST].tail; walker !== null;) {
  	      const prev = walker.prev;
  	      forEachStep(this, fn, walker, thisp);
  	      walker = prev;
  	    }
  	  }

  	  forEach (fn, thisp) {
  	    thisp = thisp || this;
  	    for (let walker = this[LRU_LIST].head; walker !== null;) {
  	      const next = walker.next;
  	      forEachStep(this, fn, walker, thisp);
  	      walker = next;
  	    }
  	  }

  	  keys () {
  	    return this[LRU_LIST].toArray().map(k => k.key)
  	  }

  	  values () {
  	    return this[LRU_LIST].toArray().map(k => k.value)
  	  }

  	  reset () {
  	    if (this[DISPOSE] &&
  	        this[LRU_LIST] &&
  	        this[LRU_LIST].length) {
  	      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
  	    }

  	    this[CACHE] = new Map(); // hash of items by key
  	    this[LRU_LIST] = new Yallist(); // list of items in order of use recency
  	    this[LENGTH] = 0; // length of items in the list
  	  }

  	  dump () {
  	    return this[LRU_LIST].map(hit =>
  	      isStale(this, hit) ? false : {
  	        k: hit.key,
  	        v: hit.value,
  	        e: hit.now + (hit.maxAge || 0)
  	      }).toArray().filter(h => h)
  	  }

  	  dumpLru () {
  	    return this[LRU_LIST]
  	  }

  	  set (key, value, maxAge) {
  	    maxAge = maxAge || this[MAX_AGE];

  	    if (maxAge && typeof maxAge !== 'number')
  	      throw new TypeError('maxAge must be a number')

  	    const now = maxAge ? Date.now() : 0;
  	    const len = this[LENGTH_CALCULATOR](value, key);

  	    if (this[CACHE].has(key)) {
  	      if (len > this[MAX]) {
  	        del(this, this[CACHE].get(key));
  	        return false
  	      }

  	      const node = this[CACHE].get(key);
  	      const item = node.value;

  	      // dispose of the old one before overwriting
  	      // split out into 2 ifs for better coverage tracking
  	      if (this[DISPOSE]) {
  	        if (!this[NO_DISPOSE_ON_SET])
  	          this[DISPOSE](key, item.value);
  	      }

  	      item.now = now;
  	      item.maxAge = maxAge;
  	      item.value = value;
  	      this[LENGTH] += len - item.length;
  	      item.length = len;
  	      this.get(key);
  	      trim(this);
  	      return true
  	    }

  	    const hit = new Entry(key, value, len, now, maxAge);

  	    // oversized objects fall out of cache automatically.
  	    if (hit.length > this[MAX]) {
  	      if (this[DISPOSE])
  	        this[DISPOSE](key, value);

  	      return false
  	    }

  	    this[LENGTH] += hit.length;
  	    this[LRU_LIST].unshift(hit);
  	    this[CACHE].set(key, this[LRU_LIST].head);
  	    trim(this);
  	    return true
  	  }

  	  has (key) {
  	    if (!this[CACHE].has(key)) return false
  	    const hit = this[CACHE].get(key).value;
  	    return !isStale(this, hit)
  	  }

  	  get (key) {
  	    return get(this, key, true)
  	  }

  	  peek (key) {
  	    return get(this, key, false)
  	  }

  	  pop () {
  	    const node = this[LRU_LIST].tail;
  	    if (!node)
  	      return null

  	    del(this, node);
  	    return node.value
  	  }

  	  del (key) {
  	    del(this, this[CACHE].get(key));
  	  }

  	  load (arr) {
  	    // reset the cache
  	    this.reset();

  	    const now = Date.now();
  	    // A previous serialized cache has the most recent items first
  	    for (let l = arr.length - 1; l >= 0; l--) {
  	      const hit = arr[l];
  	      const expiresAt = hit.e || 0;
  	      if (expiresAt === 0)
  	        // the item was created without expiration in a non aged cache
  	        this.set(hit.k, hit.v);
  	      else {
  	        const maxAge = expiresAt - now;
  	        // dont add already expired items
  	        if (maxAge > 0) {
  	          this.set(hit.k, hit.v, maxAge);
  	        }
  	      }
  	    }
  	  }

  	  prune () {
  	    this[CACHE].forEach((value, key) => get(this, key, false));
  	  }
  	}

  	const get = (self, key, doUse) => {
  	  const node = self[CACHE].get(key);
  	  if (node) {
  	    const hit = node.value;
  	    if (isStale(self, hit)) {
  	      del(self, node);
  	      if (!self[ALLOW_STALE])
  	        return undefined
  	    } else {
  	      if (doUse) {
  	        if (self[UPDATE_AGE_ON_GET])
  	          node.value.now = Date.now();
  	        self[LRU_LIST].unshiftNode(node);
  	      }
  	    }
  	    return hit.value
  	  }
  	};

  	const isStale = (self, hit) => {
  	  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
  	    return false

  	  const diff = Date.now() - hit.now;
  	  return hit.maxAge ? diff > hit.maxAge
  	    : self[MAX_AGE] && (diff > self[MAX_AGE])
  	};

  	const trim = self => {
  	  if (self[LENGTH] > self[MAX]) {
  	    for (let walker = self[LRU_LIST].tail;
  	      self[LENGTH] > self[MAX] && walker !== null;) {
  	      // We know that we're about to delete this one, and also
  	      // what the next least recently used key will be, so just
  	      // go ahead and set it now.
  	      const prev = walker.prev;
  	      del(self, walker);
  	      walker = prev;
  	    }
  	  }
  	};

  	const del = (self, node) => {
  	  if (node) {
  	    const hit = node.value;
  	    if (self[DISPOSE])
  	      self[DISPOSE](hit.key, hit.value);

  	    self[LENGTH] -= hit.length;
  	    self[CACHE].delete(hit.key);
  	    self[LRU_LIST].removeNode(node);
  	  }
  	};

  	class Entry {
  	  constructor (key, value, length, now, maxAge) {
  	    this.key = key;
  	    this.value = value;
  	    this.length = length;
  	    this.now = now;
  	    this.maxAge = maxAge || 0;
  	  }
  	}

  	const forEachStep = (self, fn, node, thisp) => {
  	  let hit = node.value;
  	  if (isStale(self, hit)) {
  	    del(self, node);
  	    if (!self[ALLOW_STALE])
  	      hit = undefined;
  	  }
  	  if (hit)
  	    fn.call(thisp, hit.value, hit.key, self);
  	};

  	lruCache = LRUCache;
  	return lruCache;
  }

  var range;
  var hasRequiredRange;

  function requireRange () {
  	if (hasRequiredRange) return range;
  	hasRequiredRange = 1;
  	// hoisted class for cyclic dependency
  	class Range {
  	  constructor (range, options) {
  	    options = parseOptions(options);

  	    if (range instanceof Range) {
  	      if (
  	        range.loose === !!options.loose &&
  	        range.includePrerelease === !!options.includePrerelease
  	      ) {
  	        return range
  	      } else {
  	        return new Range(range.raw, options)
  	      }
  	    }

  	    if (range instanceof Comparator) {
  	      // just put it in the set and return
  	      this.raw = range.value;
  	      this.set = [[range]];
  	      this.format();
  	      return this
  	    }

  	    this.options = options;
  	    this.loose = !!options.loose;
  	    this.includePrerelease = !!options.includePrerelease;

  	    // First reduce all whitespace as much as possible so we do not have to rely
  	    // on potentially slow regexes like \s*. This is then stored and used for
  	    // future error messages as well.
  	    this.raw = range
  	      .trim()
  	      .split(/\s+/)
  	      .join(' ');

  	    // First, split on ||
  	    this.set = this.raw
  	      .split('||')
  	      // map the range to a 2d array of comparators
  	      .map(r => this.parseRange(r.trim()))
  	      // throw out any comparator lists that are empty
  	      // this generally means that it was not a valid range, which is allowed
  	      // in loose mode, but will still throw if the WHOLE range is invalid.
  	      .filter(c => c.length);

  	    if (!this.set.length) {
  	      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
  	    }

  	    // if we have any that are not the null set, throw out null sets.
  	    if (this.set.length > 1) {
  	      // keep the first one, in case they're all null sets
  	      const first = this.set[0];
  	      this.set = this.set.filter(c => !isNullSet(c[0]));
  	      if (this.set.length === 0) {
  	        this.set = [first];
  	      } else if (this.set.length > 1) {
  	        // if we have any that are *, then the range is just *
  	        for (const c of this.set) {
  	          if (c.length === 1 && isAny(c[0])) {
  	            this.set = [c];
  	            break
  	          }
  	        }
  	      }
  	    }

  	    this.format();
  	  }

  	  format () {
  	    this.range = this.set
  	      .map((comps) => comps.join(' ').trim())
  	      .join('||')
  	      .trim();
  	    return this.range
  	  }

  	  toString () {
  	    return this.range
  	  }

  	  parseRange (range) {
  	    // memoize range parsing for performance.
  	    // this is a very hot path, and fully deterministic.
  	    const memoOpts =
  	      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
  	      (this.options.loose && FLAG_LOOSE);
  	    const memoKey = memoOpts + ':' + range;
  	    const cached = cache.get(memoKey);
  	    if (cached) {
  	      return cached
  	    }

  	    const loose = this.options.loose;
  	    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  	    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
  	    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
  	    debug('hyphen replace', range);

  	    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  	    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
  	    debug('comparator trim', range);

  	    // `~ 1.2.3` => `~1.2.3`
  	    range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
  	    debug('tilde trim', range);

  	    // `^ 1.2.3` => `^1.2.3`
  	    range = range.replace(re[t.CARETTRIM], caretTrimReplace);
  	    debug('caret trim', range);

  	    // At this point, the range is completely trimmed and
  	    // ready to be split into comparators.

  	    let rangeList = range
  	      .split(' ')
  	      .map(comp => parseComparator(comp, this.options))
  	      .join(' ')
  	      .split(/\s+/)
  	      // >=0.0.0 is equivalent to *
  	      .map(comp => replaceGTE0(comp, this.options));

  	    if (loose) {
  	      // in loose mode, throw out any that are not valid comparators
  	      rangeList = rangeList.filter(comp => {
  	        debug('loose invalid filter', comp, this.options);
  	        return !!comp.match(re[t.COMPARATORLOOSE])
  	      });
  	    }
  	    debug('range list', rangeList);

  	    // if any comparators are the null set, then replace with JUST null set
  	    // if more than one comparator, remove any * comparators
  	    // also, don't include the same comparator more than once
  	    const rangeMap = new Map();
  	    const comparators = rangeList.map(comp => new Comparator(comp, this.options));
  	    for (const comp of comparators) {
  	      if (isNullSet(comp)) {
  	        return [comp]
  	      }
  	      rangeMap.set(comp.value, comp);
  	    }
  	    if (rangeMap.size > 1 && rangeMap.has('')) {
  	      rangeMap.delete('');
  	    }

  	    const result = [...rangeMap.values()];
  	    cache.set(memoKey, result);
  	    return result
  	  }

  	  intersects (range, options) {
  	    if (!(range instanceof Range)) {
  	      throw new TypeError('a Range is required')
  	    }

  	    return this.set.some((thisComparators) => {
  	      return (
  	        isSatisfiable(thisComparators, options) &&
  	        range.set.some((rangeComparators) => {
  	          return (
  	            isSatisfiable(rangeComparators, options) &&
  	            thisComparators.every((thisComparator) => {
  	              return rangeComparators.every((rangeComparator) => {
  	                return thisComparator.intersects(rangeComparator, options)
  	              })
  	            })
  	          )
  	        })
  	      )
  	    })
  	  }

  	  // if ANY of the sets match ALL of its comparators, then pass
  	  test (version) {
  	    if (!version) {
  	      return false
  	    }

  	    if (typeof version === 'string') {
  	      try {
  	        version = new SemVer(version, this.options);
  	      } catch (er) {
  	        return false
  	      }
  	    }

  	    for (let i = 0; i < this.set.length; i++) {
  	      if (testSet(this.set[i], version, this.options)) {
  	        return true
  	      }
  	    }
  	    return false
  	  }
  	}

  	range = Range;

  	const LRU = requireLruCache();
  	const cache = new LRU({ max: 1000 });

  	const parseOptions = parseOptions_1;
  	const Comparator = requireComparator();
  	const debug = debug_1;
  	const SemVer = semver$2;
  	const {
  	  safeRe: re,
  	  t,
  	  comparatorTrimReplace,
  	  tildeTrimReplace,
  	  caretTrimReplace,
  	} = reExports;
  	const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants$1;

  	const isNullSet = c => c.value === '<0.0.0-0';
  	const isAny = c => c.value === '';

  	// take a set of comparators and determine whether there
  	// exists a version which can satisfy it
  	const isSatisfiable = (comparators, options) => {
  	  let result = true;
  	  const remainingComparators = comparators.slice();
  	  let testComparator = remainingComparators.pop();

  	  while (result && remainingComparators.length) {
  	    result = remainingComparators.every((otherComparator) => {
  	      return testComparator.intersects(otherComparator, options)
  	    });

  	    testComparator = remainingComparators.pop();
  	  }

  	  return result
  	};

  	// comprised of xranges, tildes, stars, and gtlt's at this point.
  	// already replaced the hyphen ranges
  	// turn into a set of JUST comparators.
  	const parseComparator = (comp, options) => {
  	  debug('comp', comp, options);
  	  comp = replaceCarets(comp, options);
  	  debug('caret', comp);
  	  comp = replaceTildes(comp, options);
  	  debug('tildes', comp);
  	  comp = replaceXRanges(comp, options);
  	  debug('xrange', comp);
  	  comp = replaceStars(comp, options);
  	  debug('stars', comp);
  	  return comp
  	};

  	const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

  	// ~, ~> --> * (any, kinda silly)
  	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
  	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
  	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
  	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
  	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
  	// ~0.0.1 --> >=0.0.1 <0.1.0-0
  	const replaceTildes = (comp, options) => {
  	  return comp
  	    .trim()
  	    .split(/\s+/)
  	    .map((c) => replaceTilde(c, options))
  	    .join(' ')
  	};

  	const replaceTilde = (comp, options) => {
  	  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
  	  return comp.replace(r, (_, M, m, p, pr) => {
  	    debug('tilde', comp, _, M, m, p, pr);
  	    let ret;

  	    if (isX(M)) {
  	      ret = '';
  	    } else if (isX(m)) {
  	      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
  	    } else if (isX(p)) {
  	      // ~1.2 == >=1.2.0 <1.3.0-0
  	      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
  	    } else if (pr) {
  	      debug('replaceTilde pr', pr);
  	      ret = `>=${M}.${m}.${p}-${pr
	      } <${M}.${+m + 1}.0-0`;
  	    } else {
  	      // ~1.2.3 == >=1.2.3 <1.3.0-0
  	      ret = `>=${M}.${m}.${p
	      } <${M}.${+m + 1}.0-0`;
  	    }

  	    debug('tilde return', ret);
  	    return ret
  	  })
  	};

  	// ^ --> * (any, kinda silly)
  	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
  	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
  	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
  	// ^1.2.3 --> >=1.2.3 <2.0.0-0
  	// ^1.2.0 --> >=1.2.0 <2.0.0-0
  	// ^0.0.1 --> >=0.0.1 <0.0.2-0
  	// ^0.1.0 --> >=0.1.0 <0.2.0-0
  	const replaceCarets = (comp, options) => {
  	  return comp
  	    .trim()
  	    .split(/\s+/)
  	    .map((c) => replaceCaret(c, options))
  	    .join(' ')
  	};

  	const replaceCaret = (comp, options) => {
  	  debug('caret', comp, options);
  	  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
  	  const z = options.includePrerelease ? '-0' : '';
  	  return comp.replace(r, (_, M, m, p, pr) => {
  	    debug('caret', comp, _, M, m, p, pr);
  	    let ret;

  	    if (isX(M)) {
  	      ret = '';
  	    } else if (isX(m)) {
  	      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
  	    } else if (isX(p)) {
  	      if (M === '0') {
  	        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
  	      } else {
  	        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
  	      }
  	    } else if (pr) {
  	      debug('replaceCaret pr', pr);
  	      if (M === '0') {
  	        if (m === '0') {
  	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${m}.${+p + 1}-0`;
  	        } else {
  	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${+m + 1}.0-0`;
  	        }
  	      } else {
  	        ret = `>=${M}.${m}.${p}-${pr
	        } <${+M + 1}.0.0-0`;
  	      }
  	    } else {
  	      debug('no pr');
  	      if (M === '0') {
  	        if (m === '0') {
  	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${m}.${+p + 1}-0`;
  	        } else {
  	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${+m + 1}.0-0`;
  	        }
  	      } else {
  	        ret = `>=${M}.${m}.${p
	        } <${+M + 1}.0.0-0`;
  	      }
  	    }

  	    debug('caret return', ret);
  	    return ret
  	  })
  	};

  	const replaceXRanges = (comp, options) => {
  	  debug('replaceXRanges', comp, options);
  	  return comp
  	    .split(/\s+/)
  	    .map((c) => replaceXRange(c, options))
  	    .join(' ')
  	};

  	const replaceXRange = (comp, options) => {
  	  comp = comp.trim();
  	  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
  	  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
  	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
  	    const xM = isX(M);
  	    const xm = xM || isX(m);
  	    const xp = xm || isX(p);
  	    const anyX = xp;

  	    if (gtlt === '=' && anyX) {
  	      gtlt = '';
  	    }

  	    // if we're including prereleases in the match, then we need
  	    // to fix this to -0, the lowest possible prerelease value
  	    pr = options.includePrerelease ? '-0' : '';

  	    if (xM) {
  	      if (gtlt === '>' || gtlt === '<') {
  	        // nothing is allowed
  	        ret = '<0.0.0-0';
  	      } else {
  	        // nothing is forbidden
  	        ret = '*';
  	      }
  	    } else if (gtlt && anyX) {
  	      // we know patch is an x, because we have any x at all.
  	      // replace X with 0
  	      if (xm) {
  	        m = 0;
  	      }
  	      p = 0;

  	      if (gtlt === '>') {
  	        // >1 => >=2.0.0
  	        // >1.2 => >=1.3.0
  	        gtlt = '>=';
  	        if (xm) {
  	          M = +M + 1;
  	          m = 0;
  	          p = 0;
  	        } else {
  	          m = +m + 1;
  	          p = 0;
  	        }
  	      } else if (gtlt === '<=') {
  	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
  	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
  	        gtlt = '<';
  	        if (xm) {
  	          M = +M + 1;
  	        } else {
  	          m = +m + 1;
  	        }
  	      }

  	      if (gtlt === '<') {
  	        pr = '-0';
  	      }

  	      ret = `${gtlt + M}.${m}.${p}${pr}`;
  	    } else if (xm) {
  	      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
  	    } else if (xp) {
  	      ret = `>=${M}.${m}.0${pr
	      } <${M}.${+m + 1}.0-0`;
  	    }

  	    debug('xRange return', ret);

  	    return ret
  	  })
  	};

  	// Because * is AND-ed with everything else in the comparator,
  	// and '' means "any version", just remove the *s entirely.
  	const replaceStars = (comp, options) => {
  	  debug('replaceStars', comp, options);
  	  // Looseness is ignored here.  star is always as loose as it gets!
  	  return comp
  	    .trim()
  	    .replace(re[t.STAR], '')
  	};

  	const replaceGTE0 = (comp, options) => {
  	  debug('replaceGTE0', comp, options);
  	  return comp
  	    .trim()
  	    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
  	};

  	// This function is passed to string.replace(re[t.HYPHENRANGE])
  	// M, m, patch, prerelease, build
  	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
  	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
  	// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
  	const hyphenReplace = incPr => ($0,
  	  from, fM, fm, fp, fpr, fb,
  	  to, tM, tm, tp, tpr, tb) => {
  	  if (isX(fM)) {
  	    from = '';
  	  } else if (isX(fm)) {
  	    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
  	  } else if (isX(fp)) {
  	    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
  	  } else if (fpr) {
  	    from = `>=${from}`;
  	  } else {
  	    from = `>=${from}${incPr ? '-0' : ''}`;
  	  }

  	  if (isX(tM)) {
  	    to = '';
  	  } else if (isX(tm)) {
  	    to = `<${+tM + 1}.0.0-0`;
  	  } else if (isX(tp)) {
  	    to = `<${tM}.${+tm + 1}.0-0`;
  	  } else if (tpr) {
  	    to = `<=${tM}.${tm}.${tp}-${tpr}`;
  	  } else if (incPr) {
  	    to = `<${tM}.${tm}.${+tp + 1}-0`;
  	  } else {
  	    to = `<=${to}`;
  	  }

  	  return `${from} ${to}`.trim()
  	};

  	const testSet = (set, version, options) => {
  	  for (let i = 0; i < set.length; i++) {
  	    if (!set[i].test(version)) {
  	      return false
  	    }
  	  }

  	  if (version.prerelease.length && !options.includePrerelease) {
  	    // Find the set of versions that are allowed to have prereleases
  	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
  	    // That should allow `1.2.3-pr.2` to pass.
  	    // However, `1.2.4-alpha.notready` should NOT be allowed,
  	    // even though it's within the range set by the comparators.
  	    for (let i = 0; i < set.length; i++) {
  	      debug(set[i].semver);
  	      if (set[i].semver === Comparator.ANY) {
  	        continue
  	      }

  	      if (set[i].semver.prerelease.length > 0) {
  	        const allowed = set[i].semver;
  	        if (allowed.major === version.major &&
  	            allowed.minor === version.minor &&
  	            allowed.patch === version.patch) {
  	          return true
  	        }
  	      }
  	    }

  	    // Version has a -pre, but it's not one of the ones we like.
  	    return false
  	  }

  	  return true
  	};
  	return range;
  }

  var comparator;
  var hasRequiredComparator;

  function requireComparator () {
  	if (hasRequiredComparator) return comparator;
  	hasRequiredComparator = 1;
  	const ANY = Symbol('SemVer ANY');
  	// hoisted class for cyclic dependency
  	class Comparator {
  	  static get ANY () {
  	    return ANY
  	  }

  	  constructor (comp, options) {
  	    options = parseOptions(options);

  	    if (comp instanceof Comparator) {
  	      if (comp.loose === !!options.loose) {
  	        return comp
  	      } else {
  	        comp = comp.value;
  	      }
  	    }

  	    comp = comp.trim().split(/\s+/).join(' ');
  	    debug('comparator', comp, options);
  	    this.options = options;
  	    this.loose = !!options.loose;
  	    this.parse(comp);

  	    if (this.semver === ANY) {
  	      this.value = '';
  	    } else {
  	      this.value = this.operator + this.semver.version;
  	    }

  	    debug('comp', this);
  	  }

  	  parse (comp) {
  	    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
  	    const m = comp.match(r);

  	    if (!m) {
  	      throw new TypeError(`Invalid comparator: ${comp}`)
  	    }

  	    this.operator = m[1] !== undefined ? m[1] : '';
  	    if (this.operator === '=') {
  	      this.operator = '';
  	    }

  	    // if it literally is just '>' or '' then allow anything.
  	    if (!m[2]) {
  	      this.semver = ANY;
  	    } else {
  	      this.semver = new SemVer(m[2], this.options.loose);
  	    }
  	  }

  	  toString () {
  	    return this.value
  	  }

  	  test (version) {
  	    debug('Comparator.test', version, this.options.loose);

  	    if (this.semver === ANY || version === ANY) {
  	      return true
  	    }

  	    if (typeof version === 'string') {
  	      try {
  	        version = new SemVer(version, this.options);
  	      } catch (er) {
  	        return false
  	      }
  	    }

  	    return cmp(version, this.operator, this.semver, this.options)
  	  }

  	  intersects (comp, options) {
  	    if (!(comp instanceof Comparator)) {
  	      throw new TypeError('a Comparator is required')
  	    }

  	    if (this.operator === '') {
  	      if (this.value === '') {
  	        return true
  	      }
  	      return new Range(comp.value, options).test(this.value)
  	    } else if (comp.operator === '') {
  	      if (comp.value === '') {
  	        return true
  	      }
  	      return new Range(this.value, options).test(comp.semver)
  	    }

  	    options = parseOptions(options);

  	    // Special cases where nothing can possibly be lower
  	    if (options.includePrerelease &&
  	      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
  	      return false
  	    }
  	    if (!options.includePrerelease &&
  	      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
  	      return false
  	    }

  	    // Same direction increasing (> or >=)
  	    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
  	      return true
  	    }
  	    // Same direction decreasing (< or <=)
  	    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
  	      return true
  	    }
  	    // same SemVer and both sides are inclusive (<= or >=)
  	    if (
  	      (this.semver.version === comp.semver.version) &&
  	      this.operator.includes('=') && comp.operator.includes('=')) {
  	      return true
  	    }
  	    // opposite directions less than
  	    if (cmp(this.semver, '<', comp.semver, options) &&
  	      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
  	      return true
  	    }
  	    // opposite directions greater than
  	    if (cmp(this.semver, '>', comp.semver, options) &&
  	      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
  	      return true
  	    }
  	    return false
  	  }
  	}

  	comparator = Comparator;

  	const parseOptions = parseOptions_1;
  	const { safeRe: re, t } = reExports;
  	const cmp = cmp_1;
  	const debug = debug_1;
  	const SemVer = semver$2;
  	const Range = requireRange();
  	return comparator;
  }

  const Range$9 = requireRange();
  const satisfies$4 = (version, range, options) => {
    try {
      range = new Range$9(range, options);
    } catch (er) {
      return false
    }
    return range.test(version)
  };
  var satisfies_1 = satisfies$4;

  const Range$8 = requireRange();

  // Mostly just for testing and legacy API reasons
  const toComparators$1 = (range, options) =>
    new Range$8(range, options).set
      .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

  var toComparators_1 = toComparators$1;

  const SemVer$4 = semver$2;
  const Range$7 = requireRange();

  const maxSatisfying$1 = (versions, range, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range$7(range, options);
    } catch (er) {
      return null
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        // satisfies(v, range, options)
        if (!max || maxSV.compare(v) === -1) {
          // compare(max, v, true)
          max = v;
          maxSV = new SemVer$4(max, options);
        }
      }
    });
    return max
  };
  var maxSatisfying_1 = maxSatisfying$1;

  const SemVer$3 = semver$2;
  const Range$6 = requireRange();
  const minSatisfying$1 = (versions, range, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range$6(range, options);
    } catch (er) {
      return null
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        // satisfies(v, range, options)
        if (!min || minSV.compare(v) === 1) {
          // compare(min, v, true)
          min = v;
          minSV = new SemVer$3(min, options);
        }
      }
    });
    return min
  };
  var minSatisfying_1 = minSatisfying$1;

  const SemVer$2 = semver$2;
  const Range$5 = requireRange();
  const gt$2 = gt_1;

  const minVersion$1 = (range, loose) => {
    range = new Range$5(range, loose);

    let minver = new SemVer$2('0.0.0');
    if (range.test(minver)) {
      return minver
    }

    minver = new SemVer$2('0.0.0-0');
    if (range.test(minver)) {
      return minver
    }

    minver = null;
    for (let i = 0; i < range.set.length; ++i) {
      const comparators = range.set[i];

      let setMin = null;
      comparators.forEach((comparator) => {
        // Clone to avoid manipulating the comparator's semver object.
        const compver = new SemVer$2(comparator.semver.version);
        switch (comparator.operator) {
          case '>':
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
            /* fallthrough */
          case '':
          case '>=':
            if (!setMin || gt$2(compver, setMin)) {
              setMin = compver;
            }
            break
          case '<':
          case '<=':
            /* Ignore maximum versions */
            break
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`)
        }
      });
      if (setMin && (!minver || gt$2(minver, setMin))) {
        minver = setMin;
      }
    }

    if (minver && range.test(minver)) {
      return minver
    }

    return null
  };
  var minVersion_1 = minVersion$1;

  const Range$4 = requireRange();
  const validRange$1 = (range, options) => {
    try {
      // Return '*' instead of '' so that truthiness works.
      // This will throw if it's invalid anyway
      return new Range$4(range, options).range || '*'
    } catch (er) {
      return null
    }
  };
  var valid$1 = validRange$1;

  const SemVer$1 = semver$2;
  const Comparator$2 = requireComparator();
  const { ANY: ANY$1 } = Comparator$2;
  const Range$3 = requireRange();
  const satisfies$3 = satisfies_1;
  const gt$1 = gt_1;
  const lt$1 = lt_1;
  const lte$1 = lte_1;
  const gte$1 = gte_1;

  const outside$3 = (version, range, hilo, options) => {
    version = new SemVer$1(version, options);
    range = new Range$3(range, options);

    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case '>':
        gtfn = gt$1;
        ltefn = lte$1;
        ltfn = lt$1;
        comp = '>';
        ecomp = '>=';
        break
      case '<':
        gtfn = lt$1;
        ltefn = gte$1;
        ltfn = gt$1;
        comp = '<';
        ecomp = '<=';
        break
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"')
    }

    // If it satisfies the range it is not outside
    if (satisfies$3(version, range, options)) {
      return false
    }

    // From now on, variable terms are as if we're in "gtr" mode.
    // but note that everything is flipped for the "ltr" function.

    for (let i = 0; i < range.set.length; ++i) {
      const comparators = range.set[i];

      let high = null;
      let low = null;

      comparators.forEach((comparator) => {
        if (comparator.semver === ANY$1) {
          comparator = new Comparator$2('>=0.0.0');
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator;
        }
      });

      // If the edge version comparator has a operator then our version
      // isn't outside it
      if (high.operator === comp || high.operator === ecomp) {
        return false
      }

      // If the lowest version comparator has an operator and our version
      // is less than it then it isn't higher than the range
      if ((!low.operator || low.operator === comp) &&
          ltefn(version, low.semver)) {
        return false
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false
      }
    }
    return true
  };

  var outside_1 = outside$3;

  // Determine if version is greater than all the versions possible in the range.
  const outside$2 = outside_1;
  const gtr$1 = (version, range, options) => outside$2(version, range, '>', options);
  var gtr_1 = gtr$1;

  const outside$1 = outside_1;
  // Determine if version is less than all the versions possible in the range
  const ltr$1 = (version, range, options) => outside$1(version, range, '<', options);
  var ltr_1 = ltr$1;

  const Range$2 = requireRange();
  const intersects$1 = (r1, r2, options) => {
    r1 = new Range$2(r1, options);
    r2 = new Range$2(r2, options);
    return r1.intersects(r2, options)
  };
  var intersects_1 = intersects$1;

  // given a set of versions and a range, create a "simplified" range
  // that includes the same versions that the original range does
  // If the original range is shorter than the simplified one, return that.
  const satisfies$2 = satisfies_1;
  const compare$2 = compare_1;
  var simplify = (versions, range, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare$2(a, b, options));
    for (const version of v) {
      const included = satisfies$2(version, range, options);
      if (included) {
        prev = version;
        if (!first) {
          first = version;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }

    const ranges = [];
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min);
      } else if (!max && min === v[0]) {
        ranges.push('*');
      } else if (!max) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max}`);
      } else {
        ranges.push(`${min} - ${max}`);
      }
    }
    const simplified = ranges.join(' || ');
    const original = typeof range.raw === 'string' ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range
  };

  const Range$1 = requireRange();
  const Comparator$1 = requireComparator();
  const { ANY } = Comparator$1;
  const satisfies$1 = satisfies_1;
  const compare$1 = compare_1;

  // Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
  // - Every simple range `r1, r2, ...` is a null set, OR
  // - Every simple range `r1, r2, ...` which is not a null set is a subset of
  //   some `R1, R2, ...`
  //
  // Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
  // - If c is only the ANY comparator
  //   - If C is only the ANY comparator, return true
  //   - Else if in prerelease mode, return false
  //   - else replace c with `[>=0.0.0]`
  // - If C is only the ANY comparator
  //   - if in prerelease mode, return true
  //   - else replace C with `[>=0.0.0]`
  // - Let EQ be the set of = comparators in c
  // - If EQ is more than one, return true (null set)
  // - Let GT be the highest > or >= comparator in c
  // - Let LT be the lowest < or <= comparator in c
  // - If GT and LT, and GT.semver > LT.semver, return true (null set)
  // - If any C is a = range, and GT or LT are set, return false
  // - If EQ
  //   - If GT, and EQ does not satisfy GT, return true (null set)
  //   - If LT, and EQ does not satisfy LT, return true (null set)
  //   - If EQ satisfies every C, return true
  //   - Else return false
  // - If GT
  //   - If GT.semver is lower than any > or >= comp in C, return false
  //   - If GT is >=, and GT.semver does not satisfy every C, return false
  //   - If GT.semver has a prerelease, and not in prerelease mode
  //     - If no C has a prerelease and the GT.semver tuple, return false
  // - If LT
  //   - If LT.semver is greater than any < or <= comp in C, return false
  //   - If LT is <=, and LT.semver does not satisfy every C, return false
  //   - If GT.semver has a prerelease, and not in prerelease mode
  //     - If no C has a prerelease and the LT.semver tuple, return false
  // - Else return true

  const subset$1 = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true
    }

    sub = new Range$1(sub, options);
    dom = new Range$1(dom, options);
    let sawNonNull = false;

    OUTER: for (const simpleSub of sub.set) {
      for (const simpleDom of dom.set) {
        const isSub = simpleSubset(simpleSub, simpleDom, options);
        sawNonNull = sawNonNull || isSub !== null;
        if (isSub) {
          continue OUTER
        }
      }
      // the null set is a subset of everything, but null simple ranges in
      // a complex range should be ignored.  so if we saw a non-null range,
      // then we know this isn't a subset, but if EVERY simple range was null,
      // then it is a subset.
      if (sawNonNull) {
        return false
      }
    }
    return true
  };

  const minimumVersionWithPreRelease = [new Comparator$1('>=0.0.0-0')];
  const minimumVersion = [new Comparator$1('>=0.0.0')];

  const simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true
    }

    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }

    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true
      } else {
        dom = minimumVersion;
      }
    }

    const eqSet = new Set();
    let gt, lt;
    for (const c of sub) {
      if (c.operator === '>' || c.operator === '>=') {
        gt = higherGT(gt, c, options);
      } else if (c.operator === '<' || c.operator === '<=') {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }

    if (eqSet.size > 1) {
      return null
    }

    let gtltComp;
    if (gt && lt) {
      gtltComp = compare$1(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null
      } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
        return null
      }
    }

    // will iterate one or zero times
    for (const eq of eqSet) {
      if (gt && !satisfies$1(eq, String(gt), options)) {
        return null
      }

      if (lt && !satisfies$1(eq, String(lt), options)) {
        return null
      }

      for (const c of dom) {
        if (!satisfies$1(eq, String(c), options)) {
          return false
        }
      }

      return true
    }

    let higher, lower;
    let hasDomLT, hasDomGT;
    // if the subset has a prerelease, we need a comparator in the superset
    // with the same tuple and a prerelease, or it's not a subset
    let needDomLTPre = lt &&
      !options.includePrerelease &&
      lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt &&
      !options.includePrerelease &&
      gt.semver.prerelease.length ? gt.semver : false;
    // exception: <1.2.3-0 is the same as <1.2.3
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
        lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }

    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
      hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length &&
              c.semver.major === needDomGTPre.major &&
              c.semver.minor === needDomGTPre.minor &&
              c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === '>' || c.operator === '>=') {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false
          }
        } else if (gt.operator === '>=' && !satisfies$1(gt.semver, String(c), options)) {
          return false
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length &&
              c.semver.major === needDomLTPre.major &&
              c.semver.minor === needDomLTPre.minor &&
              c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === '<' || c.operator === '<=') {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false
          }
        } else if (lt.operator === '<=' && !satisfies$1(lt.semver, String(c), options)) {
          return false
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false
      }
    }

    // if there was a < or >, and nothing in the dom, then must be false
    // UNLESS it was limited by another range in the other direction.
    // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false
    }

    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false
    }

    // we needed a prerelease range in a specific tuple, but didn't get one
    // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
    // because it includes prereleases in the 1.2.3 tuple
    if (needDomGTPre || needDomLTPre) {
      return false
    }

    return true
  };

  // >=1.2.3 is lower than >1.2.3
  const higherGT = (a, b, options) => {
    if (!a) {
      return b
    }
    const comp = compare$1(a.semver, b.semver, options);
    return comp > 0 ? a
      : comp < 0 ? b
      : b.operator === '>' && a.operator === '>=' ? b
      : a
  };

  // <=1.2.3 is higher than <1.2.3
  const lowerLT = (a, b, options) => {
    if (!a) {
      return b
    }
    const comp = compare$1(a.semver, b.semver, options);
    return comp < 0 ? a
      : comp > 0 ? b
      : b.operator === '<' && a.operator === '<=' ? b
      : a
  };

  var subset_1 = subset$1;

  // just pre-load all the stuff that index.js lazily exports
  const internalRe = reExports;
  const constants = constants$1;
  const SemVer = semver$2;
  const identifiers = identifiers$1;
  const parse = parse_1;
  const valid = valid_1;
  const clean = clean_1;
  const inc = inc_1;
  const diff = diff_1;
  const major = major_1;
  const minor = minor_1;
  const patch = patch_1;
  const prerelease = prerelease_1;
  const compare = compare_1;
  const rcompare = rcompare_1;
  const compareLoose = compareLoose_1;
  const compareBuild = compareBuild_1;
  const sort = sort_1;
  const rsort = rsort_1;
  const gt = gt_1;
  const lt = lt_1;
  const eq$3 = eq_1$1;
  const neq = neq_1;
  const gte = gte_1;
  const lte = lte_1;
  const cmp = cmp_1;
  const coerce = coerce_1;
  const Comparator = requireComparator();
  const Range = requireRange();
  const satisfies = satisfies_1;
  const toComparators = toComparators_1;
  const maxSatisfying = maxSatisfying_1;
  const minSatisfying = minSatisfying_1;
  const minVersion = minVersion_1;
  const validRange = valid$1;
  const outside = outside_1;
  const gtr = gtr_1;
  const ltr = ltr_1;
  const intersects = intersects_1;
  const simplifyRange = simplify;
  const subset = subset_1;
  var semver = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq: eq$3,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers,
  };

  var semver$1 = /*@__PURE__*/getDefaultExportFromCjs(semver);

  const NAME_SELECTOR = 'NAME_SELECTOR';
  const COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
  const REF_SELECTOR = 'REF_SELECTOR';
  const DOM_SELECTOR = 'DOM_SELECTOR';
  const INVALID_SELECTOR = 'INVALID_SELECTOR';

  const VUE_VERSION = Number(
    `${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`
  );

  const FUNCTIONAL_OPTIONS =
    VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

  const BEFORE_RENDER_LIFECYCLE_HOOK = semver$1.gt(Vue.version, '2.1.8')
    ? 'beforeCreate'
    : 'beforeMount';

  const CREATE_ELEMENT_ALIAS = semver$1.gt(Vue.version, '2.1.5')
    ? '_c'
    : '_h';

  // 

  function throwError(msg) {
    throw new Error(`[vue-test-utils]: ${msg}`)
  }

  function warn(msg) {
    console.error(`[vue-test-utils]: ${msg}`);
  }

  const camelizeRE = /-(\w)/g;

  const camelize = (str) => {
    const camelizedStr = str.replace(camelizeRE, (_, c) =>
      c ? c.toUpperCase() : ''
    );
    return camelizedStr.charAt(0).toLowerCase() + camelizedStr.slice(1)
  };

  /**
   * Capitalize a string.
   */
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  /**
   * Hyphenate a camelCase string.
   */
  const hyphenateRE = /\B([A-Z])/g;
  const hyphenate = (str) =>
    str.replace(hyphenateRE, '-$1').toLowerCase();

  function hasOwnProperty$a(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }

  function keys$4(obj) {
    // $FlowIgnore
    return Object.keys(obj)
  }

  function resolveComponent$1(id, components) {
    if (typeof id !== 'string') {
      return
    }
    // check local registration variations first
    if (hasOwnProperty$a(components, id)) {
      return components[id]
    }
    var camelizedId = camelize(id);
    if (hasOwnProperty$a(components, camelizedId)) {
      return components[camelizedId]
    }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwnProperty$a(components, PascalCaseId)) {
      return components[PascalCaseId]
    }
    // fallback to prototype chain
    return components[id] || components[camelizedId] || components[PascalCaseId]
  }

  const UA =
    typeof window !== 'undefined' &&
    'navigator' in window &&
    navigator.userAgent.toLowerCase();

  const isPhantomJS = UA && UA.includes && UA.match(/phantomjs/i);

  const isEdge = UA && UA.indexOf('edge/') > 0;
  const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

  // get the event used to trigger v-model handler that updates bound data
  function getCheckedEvent() {
    const version = Vue.version;

    if (semver$1.satisfies(version, '2.1.9 - 2.1.10')) {
      return 'click'
    }

    if (semver$1.satisfies(version, '2.2 - 2.4')) {
      return isChrome ? 'click' : 'change'
    }

    // change is handler for version 2.0 - 2.1.8, and 2.5+
    return 'change'
  }

  /**
   * Normalize nextTick to return a promise for all Vue 2 versions.
   * Vue < 2.1 does not return a Promise from nextTick
   * @return {Promise<R>}
   */
  function nextTick() {
    if (VUE_VERSION > 2) return Vue.nextTick()
    return new Promise(resolve => {
      Vue.nextTick(resolve);
    })
  }

  function warnDeprecated(method, fallback = '') {
    if (!config.showDeprecationWarnings) return
    let msg = `${method} is deprecated and will be removed in the next major version.`;
    if (fallback) msg += ` ${fallback}.`;
    if (config.deprecationWarningHandler) {
      config.deprecationWarningHandler(method, msg);
    } else {
      warn(msg);
    }
  }

  function isVueWrapper(wrapper) {
    return wrapper.vm || wrapper.isFunctionalComponent
  }

  // 

  function addMocks(
    _Vue,
    mockedProperties = {}
  ) {
    if (mockedProperties === false) {
      return
    }
    keys$4(mockedProperties).forEach(key => {
      try {
        // $FlowIgnore
        _Vue.prototype[key] = mockedProperties[key];
      } catch (e) {
        warn(
          `could not overwrite property ${key}, this is ` +
            `usually caused by a plugin that has added ` +
            `the property as a read-only value`
        );
      }
      // $FlowIgnore
      Vue.util.defineReactive(_Vue, key, mockedProperties[key]);
    });
  }

  // 

  function logEvents(
    vm,
    emitted,
    emittedByOrder
  ) {
    const emit = vm.$emit;
    vm.$emit = (name, ...args) => {
  (emitted[name] || (emitted[name] = [])).push(args);
      emittedByOrder.push({ name, args });
      return emit.call(vm, name, ...args)
    };
  }

  function addEventLogger(_Vue) {
    _Vue.mixin({
      beforeCreate: function () {
        this.__emitted = Object.create(null);
        this.__emittedByOrder = [];
        logEvents(this, this.__emitted, this.__emittedByOrder);
      }
    });
  }

  function addStubs(_Vue, stubComponents) {
    function addStubComponentsMixin() {
      Object.assign(this.$options.components, stubComponents);
    }

    _Vue.mixin({
      [BEFORE_RENDER_LIFECYCLE_HOOK]: addStubComponentsMixin
    });
  }

  // 

  function isDomSelector(selector) {
    if (typeof selector !== 'string') {
      return false
    }

    try {
      if (typeof document === 'undefined') {
        throwError(
          `mount must be run in a browser environment like ` +
            `PhantomJS, jsdom or chrome`
        );
      }
    } catch (error) {
      throwError(
        `mount must be run in a browser environment like ` +
          `PhantomJS, jsdom or chrome`
      );
    }

    try {
      document.querySelector(selector);
      return true
    } catch (error) {
      return false
    }
  }

  function isVueComponent(c) {
    if (isConstructor(c)) {
      return true
    }

    if (!isPlainObject(c)) {
      return false
    }

    if (c.extends || c._Ctor) {
      return true
    }

    if (typeof c.template === 'string') {
      return true
    }

    if (typeof c.setup === 'function' && !c.render) {
      return true
    }

    return typeof c.render === 'function'
  }

  function componentNeedsCompiling(component) {
    return (
      component &&
      !component.render &&
      (component.template || component.extends || component.extendOptions) &&
      !component.functional
    )
  }

  function isRefSelector(refOptionsObject) {
    if (
      !isPlainObject(refOptionsObject) ||
      keys$4(refOptionsObject || {}).length !== 1
    ) {
      return false
    }

    return typeof refOptionsObject.ref === 'string'
  }

  function isNameSelector(nameOptionsObject) {
    if (!isPlainObject(nameOptionsObject)) {
      return false
    }

    return !!nameOptionsObject.name
  }

  function isConstructor(c) {
    return typeof c === 'function' && c.cid
  }

  function isDynamicComponent(c) {
    return typeof c === 'function' && !c.cid
  }

  function isComponentOptions(c) {
    return isPlainObject(c) && (c.template || c.render)
  }

  function isFunctionalComponent(c) {
    if (!isVueComponent(c)) {
      return false
    }
    if (isConstructor(c)) {
      return c.options.functional
    }
    return c.functional
  }

  function templateContainsComponent(
    template,
    name
  ) {
    return [capitalize, camelize, hyphenate].some(format => {
      const re = new RegExp(`<${format(name)}\\s*(\\s|>|(\/>))`, 'g');
      return re.test(template)
    })
  }

  function isPlainObject(c) {
    return Object.prototype.toString.call(c) === '[object Object]'
  }

  function isHTMLElement(c) {
    if (typeof HTMLElement === 'undefined') {
      return false
    }
    // eslint-disable-next-line no-undef
    return c instanceof HTMLElement
  }

  function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) {
          return map[val.toLowerCase()]
        }
      : function (val) {
          return map[val]
        }
  }

  const isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
      'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
      'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
      'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
      's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,' +
      'embed,object,param,source,canvas,script,noscript,del,ins,' +
      'caption,col,colgroup,table,thead,tbody,td,th,tr,video,' +
      'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
      'output,progress,select,textarea,' +
      'details,dialog,menu,menuitem,summary,' +
      'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  const isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
      'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
      'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  const isReservedTag = (tag) => isHTMLTag(tag) || isSVG(tag);

  // 


  function compileTemplate(component) {
    if (component.template) {
      if (!vueTemplateCompiler.compileToFunctions) {
        throwError(
          `vueTemplateCompiler is undefined, you must pass ` +
            `precompiled components if vue-template-compiler is ` +
            `undefined`
        );
      }

      if (component.template.charAt('#') === '#') {
        var el = document.querySelector(component.template);
        if (!el) {
          throwError('Cannot find element' + component.template);

          el = document.createElement('div');
        }
        component.template = el.innerHTML;
      }

      Object.assign(component, {
        ...vueTemplateCompiler.compileToFunctions(component.template),
        name: component.name
      });
    }

    if (component.components) {
      keys$4(component.components).forEach(c => {
        const cmp = component.components[c];
        if (!cmp.render) {
          compileTemplate(cmp);
        }
      });
    }

    if (component.extends) {
      compileTemplate(component.extends);
    }

    if (component.extendOptions && !component.options.render) {
      compileTemplate(component.options);
    }
  }

  function compileTemplateForSlots(slots) {
    keys$4(slots).forEach(key => {
      const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];
      slot.forEach(slotValue => {
        if (componentNeedsCompiling(slotValue)) {
          compileTemplate(slotValue);
        }
      });
    });
  }

  // 

  const MOUNTING_OPTIONS = [
    'attachToDocument',
    'mocks',
    'slots',
    'localVue',
    'stubs',
    'context',
    'clone',
    'attrs',
    'listeners',
    'propsData',
    'shouldProxy'
  ];

  function extractInstanceOptions(options) {
    const instanceOptions = {
      ...options
    };
    MOUNTING_OPTIONS.forEach(mountingOption => {
      delete instanceOptions[mountingOption];
    });
    return instanceOptions
  }

  // 


  function isDestructuringSlotScope(slotScope) {
    return /^{.*}$/.test(slotScope)
  }

  function getVueTemplateCompilerHelpers(_Vue) {
    // $FlowIgnore
    const vue = new _Vue();
    const helpers = {};
    const names = [
      '_c',
      '_o',
      '_n',
      '_s',
      '_l',
      '_t',
      '_q',
      '_i',
      '_m',
      '_f',
      '_k',
      '_b',
      '_v',
      '_e',
      '_u',
      '_g'
    ];
    names.forEach(name => {
      helpers[name] = vue._renderProxy[name];
    });
    helpers.$createElement = vue._renderProxy.$createElement;
    helpers.$set = vue._renderProxy.$set;
    return helpers
  }

  function validateEnvironment() {
    if (VUE_VERSION < 2.1) {
      throwError(`the scopedSlots option is only supported in vue@2.1+.`);
    }
  }

  function isScopedSlot(slot) {
    if (typeof slot === 'function') return { match: null, slot }

    const slotScopeRe = /<[^>]+ slot-scope="(.+)"/;
    const vSlotRe = /<template v-slot(?::.+)?="(.+)"/;
    const shortVSlotRe = /<template #.*="(.+)"/;

    const hasOldSlotScope = slot.match(slotScopeRe);
    const hasVSlotScopeAttr = slot.match(vSlotRe);
    const hasShortVSlotScopeAttr = slot.match(shortVSlotRe);

    if (hasOldSlotScope) {
      return { slot, match: hasOldSlotScope }
    } else if (hasVSlotScopeAttr || hasShortVSlotScopeAttr) {
      // Strip v-slot and #slot attributes from `template` tag. compileToFunctions leaves empty `template` tag otherwise.
      const sanitizedSlot = slot.replace(
        /(<template)([^>]+)(>.+<\/template>)/,
        '$1$3'
      );
      return {
        slot: sanitizedSlot,
        match: hasVSlotScopeAttr || hasShortVSlotScopeAttr
      }
    }
    // we have no matches, so we just return
    return {
      slot: slot,
      match: null
    }
  }

  // Hide warning about <template> disallowed as root element
  function customWarn(msg) {
    if (msg.indexOf('Cannot use <template> as component root element') === -1) {
      console.error(msg);
    }
  }

  function createScopedSlots(
    scopedSlotsOption,
    _Vue
  ) {
    const scopedSlots = {};
    if (!scopedSlotsOption) {
      return scopedSlots
    }
    validateEnvironment();
    const helpers = getVueTemplateCompilerHelpers(_Vue);
    for (const scopedSlotName in scopedSlotsOption) {
      const slot = scopedSlotsOption[scopedSlotName];
      const isFn = typeof slot === 'function';

      const scopedSlotMatches = isScopedSlot(slot);

      // Type check to silence flow (can't use isFn)
      const renderFn =
        typeof slot === 'function'
          ? slot
          : vueTemplateCompiler.compileToFunctions(scopedSlotMatches.slot, { warn: customWarn })
              .render;

      const slotScope = scopedSlotMatches.match && scopedSlotMatches.match[1];

      scopedSlots[scopedSlotName] = function (props) {
        let res;
        if (isFn) {
          res = renderFn.call({ ...helpers }, props);
        } else if (slotScope && !isDestructuringSlotScope(slotScope)) {
          res = renderFn.call({ ...helpers, [slotScope]: props });
        } else if (slotScope && isDestructuringSlotScope(slotScope)) {
          res = renderFn.call({ ...helpers, ...props });
        } else {
          res = renderFn.call({ ...helpers, props });
        }
        // res is Array if <template> is a root element
        return Array.isArray(res) ? res[0] : res
      };
    }
    return scopedSlots
  }

  // 


  const FUNCTION_PLACEHOLDER = '[Function]';

  function isVueComponentStub(comp) {
    return (comp && comp.template) || isVueComponent(comp)
  }

  function isValidStub(stub) {
    return (
      typeof stub === 'boolean' ||
      (!!stub && typeof stub === 'string') ||
      isVueComponentStub(stub)
    )
  }

  function resolveComponent(obj, component) {
    return (
      obj[component] ||
      obj[hyphenate(component)] ||
      obj[camelize(component)] ||
      obj[capitalize(camelize(component))] ||
      obj[capitalize(component)] ||
      {}
    )
  }

  function getCoreProperties(componentOptions, name) {
    return {
      attrs: componentOptions.attrs,
      name: componentOptions.name || name,
      model: componentOptions.model,
      props: componentOptions.props,
      on: componentOptions.on,
      key: componentOptions.key,
      domProps: componentOptions.domProps,
      class: componentOptions.class,
      staticClass: componentOptions.staticClass,
      staticStyle: componentOptions.staticStyle,
      style: componentOptions.style,
      normalizedStyle: componentOptions.normalizedStyle,
      nativeOn: componentOptions.nativeOn,
      functional: componentOptions.functional,
      abstract: componentOptions.abstract
    }
  }

  function resolveOptions(component, _Vue) {
    if (isDynamicComponent(component)) {
      return {}
    }

    return isConstructor(component)
      ? component.options
      : _Vue.extend(component).options
  }

  function getScopedSlotRenderFunctions(ctx) {
    // In Vue 2.6+ a new v-slot syntax was introduced
    // scopedSlots are now saved in parent._vnode.data.scopedSlots
    // We filter out _normalized, $stable and $key keys
    if (ctx.$vnode.data.scopedSlots) {
      return keys$4(ctx.$vnode.data.scopedSlots).filter(
        x => x !== '_normalized' && x !== '$stable' && x !== '$key'
      )
    }

    return []
  }

  function createStubFromComponent(
    originalComponent,
    name,
    _Vue
  ) {
    const componentOptions = resolveOptions(originalComponent, _Vue);
    const tagName = `${name || 'anonymous'}-stub`;

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(tagName);
    }

    return {
      ...getCoreProperties(componentOptions, name),
      $_vueTestUtils_original: originalComponent,
      $_doNotStubChildren: true,
      render(h, context) {
        return h(
          tagName,
          componentOptions.functional
            ? {
                ...context.data,
                attrs: {
                  ...shapeStubProps(context.props),
                  ...context.data.attrs
                }
              }
            : {
                attrs: {
                  ...shapeStubProps(this.$props)
                }
              },
          context
            ? context.children
            : this.$options._renderChildren ||
                getScopedSlotRenderFunctions(this)
                  .map(x => {
                    let result = null;
                    try {
                      result = this.$vnode.data.scopedSlots[x]({});
                    } catch (e) {}
                    return result
                  })
                  .filter(Boolean)
        )
      }
    }
  }

  function shapeStubProps(props) {
    const shapedProps = {};
    for (const propName in props) {
      if (typeof props[propName] === 'function') {
        shapedProps[propName] = FUNCTION_PLACEHOLDER;
        continue
      }

      if (Array.isArray(props[propName])) {
        shapedProps[propName] = props[propName].map(value => {
          return typeof value === 'function' ? FUNCTION_PLACEHOLDER : value
        });
        continue
      }

      shapedProps[propName] = props[propName];
    }

    return shapedProps
  }

  // DEPRECATED: converts string stub to template stub.
  function createStubFromString(templateString, name) {
    warnDeprecated('Using a string for stubs');

    if (templateContainsComponent(templateString, name)) {
      throwError('options.stub cannot contain a circular reference');
    }

    return {
      template: templateString,
      $_doNotStubChildren: true
    }
  }

  function setStubComponentName(
    stub,
    originalComponent = {},
    _Vue
  ) {
    if (stub.name) return

    const componentOptions = resolveOptions(originalComponent, _Vue);
    stub.name = getCoreProperties(componentOptions).name;
  }

  function validateStub(stub) {
    if (!isValidStub(stub)) {
      throwError(`options.stub values must be passed a string or ` + `component`);
    }
  }

  function createStubsFromStubsObject(
    originalComponents = {},
    stubs,
    _Vue
  ) {
    return keys$4(stubs || {}).reduce((acc, stubName) => {
      let stub = stubs[stubName];

      validateStub(stub);

      if (stub === false) {
        return acc
      }

      const component = resolveComponent(originalComponents, stubName);

      if (stub === true) {
        acc[stubName] = createStubFromComponent(component, stubName, _Vue);
        return acc
      }

      if (typeof stub === 'string') {
        stub = createStubFromString(stub, stubName);
        stubs[stubName];
      }

      setStubComponentName(stub, component, _Vue);
      if (componentNeedsCompiling(stub)) {
        compileTemplate(stub);
      }

      acc[stubName] = stub;
      stub._Ctor = {};

      return acc
    }, {})
  }

  const isAllowlisted = (el, allowlist) => resolveComponent$1(el, allowlist);
  const isAlreadyStubbed = (el, stubs) => stubs.has(el);

  function shouldExtend(component, _Vue) {
    return isConstructor(component) || (component && component.extends)
  }

  function extend$2(component, _Vue) {
    const componentOptions = component.options ? component.options : component;
    const stub = _Vue.extend(componentOptions);
    stub.options.$_vueTestUtils_original = component;
    stub.options._base = _Vue;
    return stub
  }

  function createStubIfNeeded(shouldStub, component, _Vue, el) {
    if (shouldStub) {
      return createStubFromComponent(component || {}, el, _Vue)
    }

    if (shouldExtend(component)) {
      return extend$2(component, _Vue)
    }
  }

  function shouldNotBeStubbed(el, allowlist, modifiedComponents) {
    return (
      (typeof el === 'string' && isReservedTag(el)) ||
      isAllowlisted(el, allowlist) ||
      isAlreadyStubbed(el, modifiedComponents)
    )
  }

  function patchCreateElement(_Vue, stubs, stubAllComponents) {
    // This mixin patches vm.$createElement so that we can stub all components
    // before they are rendered in shallow mode. We also need to ensure that
    // component constructors were created from the _Vue constructor. If not,
    // we must replace them with components created from the _Vue constructor
    // before calling the original $createElement. This ensures that components
    // have the correct instance properties and stubs when they are rendered.
    function patchCreateElementMixin() {
      const vm = this;

      if (vm.$options.$_doNotStubChildren || vm.$options._isFunctionalContainer) {
        return
      }

      const modifiedComponents = new Set();
      const originalCreateElement = vm.$createElement;
      const originalComponents = vm.$options.components;

      const createElement = (el, ...args) => {
        if (shouldNotBeStubbed(el, stubs, modifiedComponents)) {
          return originalCreateElement(el, ...args)
        }

        if (isConstructor(el) || isComponentOptions(el)) {
          const componentOptions = isConstructor(el) ? el.options : el;
          const elName = componentOptions.name;

          const stubbedComponent = resolveComponent$1(elName, stubs);
          if (stubbedComponent) {
            return originalCreateElement(stubbedComponent, ...args)
          }

          if (stubAllComponents) {
            const stub = createStubFromComponent(el, elName || 'anonymous', _Vue);
            return originalCreateElement(stub, ...args)
          }
          const Constructor = shouldExtend(el) ? extend$2(el, _Vue) : el;

          return originalCreateElement(Constructor, ...args)
        }

        if (typeof el === 'string') {
          const original = resolveComponent$1(el, originalComponents);

          if (!original) {
            return originalCreateElement(el, ...args)
          }

          if (isDynamicComponent(original)) {
            return originalCreateElement(el, ...args)
          }

          const stub = createStubIfNeeded(stubAllComponents, original, _Vue, el);

          if (stub) {
            Object.assign(vm.$options.components, {
              [el]: stub
            });
            modifiedComponents.add(el);
          }
        }

        return originalCreateElement(el, ...args)
      };

      vm[CREATE_ELEMENT_ALIAS] = createElement;
      vm.$createElement = createElement;
    }

    _Vue.mixin({
      [BEFORE_RENDER_LIFECYCLE_HOOK]: patchCreateElementMixin
    });
  }

  // 


  function createContext(options, scopedSlots, currentProps) {
    const on = {
      ...(options.context && options.context.on),
      ...options.listeners
    };
    return {
      attrs: {
        ...options.attrs,
        // pass as attrs so that inheritAttrs works correctly
        // props should take precedence over attrs
        ...currentProps
      },
      ...(options.context || {}),
      on,
      scopedSlots
    }
  }

  function createChildren(vm, h, { slots, context }) {
    const slotVNodes = slots ? createSlotVNodes(vm, slots) : undefined;
    return (
      (context &&
        context.children &&
        context.children.map(x => (typeof x === 'function' ? x(h) : x))) ||
      slotVNodes
    )
  }

  function getValuesFromCallableOption(optionValue) {
    if (typeof optionValue === 'function') {
      return optionValue.call(this)
    }
    return optionValue
  }

  function createInstance(
    component,
    options,
    _Vue
  ) {
    const componentOptions = isConstructor(component)
      ? component.options
      : component;

    // instance options are options that are passed to the
    // root instance when it's instantiated
    const instanceOptions = extractInstanceOptions(options);

    const globalComponents = _Vue.options.components || {};
    const componentsToStub = Object.assign(
      Object.create(globalComponents),
      componentOptions.components
    );

    const stubComponentsObject = createStubsFromStubsObject(
      componentsToStub,
      // $FlowIgnore
      options.stubs,
      _Vue
    );

    addEventLogger(_Vue);
    addMocks(_Vue, options.mocks);
    addStubs(_Vue, stubComponentsObject);
    patchCreateElement(_Vue, stubComponentsObject, options.shouldProxy);

    if (componentNeedsCompiling(componentOptions)) {
      compileTemplate(componentOptions);
    }

    // used to identify extended component using constructor
    componentOptions.$_vueTestUtils_original = component;

    // watchers provided in mounting options should override preexisting ones
    if (componentOptions.watch && instanceOptions.watch) {
      const componentWatchers = keys$4(componentOptions.watch);
      const instanceWatchers = keys$4(instanceOptions.watch);

      for (let i = 0; i < instanceWatchers.length; i++) {
        const k = instanceWatchers[i];
        // override the componentOptions with the one provided in mounting options
        if (componentWatchers.includes(k)) {
          componentOptions.watch[k] = instanceOptions.watch[k];
        }
      }
    }

    // make sure all extends are based on this instance
    const Constructor = _Vue.extend(componentOptions).extend(instanceOptions);
    Constructor.options._base = _Vue;

    const scopedSlots = createScopedSlots(options.scopedSlots, _Vue);

    const parentComponentOptions = options.parentComponent || {};

    const originalParentComponentProvide = parentComponentOptions.provide;
    parentComponentOptions.provide = function () {
      return {
        ...getValuesFromCallableOption.call(this, originalParentComponentProvide),
        // $FlowIgnore
        ...getValuesFromCallableOption.call(this, options.provide)
      }
    };

    const originalParentComponentData = parentComponentOptions.data;
    parentComponentOptions.data = function () {
      return {
        ...getValuesFromCallableOption.call(this, originalParentComponentData),
        vueTestUtils_childProps: { ...options.propsData }
      }
    };

    parentComponentOptions.$_doNotStubChildren = true;
    parentComponentOptions.$_isWrapperParent = true;
    parentComponentOptions._isFunctionalContainer = componentOptions.functional;
    parentComponentOptions.render = function (h) {
      return h(
        Constructor,
        createContext(options, scopedSlots, this.vueTestUtils_childProps),
        createChildren(this, h, options)
      )
    };

    // options  "propsData" can only be used during instance creation with the `new` keyword
    // "data" should be set only on component under test to avoid reactivity issues
    const { propsData, data, ...rest } = options; // eslint-disable-line
    const Parent = _Vue.extend({
      ...rest,
      ...parentComponentOptions
    });

    return new Parent()
  }

  // 

  function createElement() {
    if (document) {
      const elem = document.createElement('div');

      if (document.body) {
        document.body.appendChild(elem);
      }
      return elem
    }
  }

  // 

  function findDOMNodes(
    element,
    selector
  ) {
    const nodes = [];
    if (!element || !element.querySelectorAll || !element.matches) {
      return nodes
    }

    if (element.matches(selector)) {
      nodes.push(element);
    }
    // $FlowIgnore
    return nodes.concat([].slice.call(element.querySelectorAll(selector)))
  }

  function vmMatchesName(vm, name) {
    // We want to mirror how Vue resolves component names in SFCs:
    // For example, <test-component />, <TestComponent /> and `<testComponent />
    // all resolve to the same component
    const componentName = isFunctionalComponent(vm)
      ? vm.name
      : vm.$options && vm.$options.name;

    return (
      !!name &&
      !!componentName &&
      (componentName === name ||
        // testComponent -> TestComponent
        componentName === capitalize(name) ||
        // test-component -> TestComponent
        componentName === capitalize(camelize(name)) ||
        // same match as above, but the component name vs query
        capitalize(camelize(componentName)) === name)
    )
  }

  function vmCtorMatches(vm, component) {
    if (
      (vm.$options && vm.$options.$_vueTestUtils_original === component) ||
      vm.$_vueTestUtils_original === component
    ) {
      return true
    }

    const Ctor = isConstructor(component)
      ? component.options._Ctor
      : component._Ctor;

    if (!Ctor) {
      return false
    }

    if (vm.constructor.extendOptions === component) {
      return true
    }

    if (component.functional) {
      return keys$4(vm._Ctor || {}).some(c => {
        return component === vm._Ctor[c].extendOptions
      })
    }
  }

  function matches(node, selector) {
    if (selector.type === DOM_SELECTOR) {
      const element = node instanceof Element ? node : node.elm;
      return element && element.matches && element.matches(selector.value)
    }

    const isFunctionalSelector = isConstructor(selector.value)
      ? selector.value.options.functional
      : selector.value.functional;

    const componentInstance =
      (isFunctionalSelector ? node[FUNCTIONAL_OPTIONS] : node.child) ||
      node[FUNCTIONAL_OPTIONS] ||
      node.child;

    if (!componentInstance) {
      return false
    }

    if (selector.type === COMPONENT_SELECTOR) {
      if (vmCtorMatches(componentInstance, selector.value)) {
        return true
      }
    }

    // Fallback to name selector for COMPONENT_SELECTOR for Vue < 2.1
    const nameSelector = isConstructor(selector.value)
      ? selector.value.extendOptions.name
      : selector.value.name;
    return vmMatchesName(componentInstance, nameSelector)
  }

  // 


  /**
   * Traverses a vue instance for its parents and returns them in an array format
   * @param {Component} vm
   * @returns {Component[]} The component and its corresponding parents, in order from left to right
   */
  function findAllParentInstances(childVm) {
    const instances = [childVm];

    function getParent(_vm) {
      if (_vm && _vm.$parent) {
        instances.push(_vm.$parent);
        return getParent(_vm.$parent)
      }
      return _vm
    }

    getParent(childVm);
    return instances
  }

  function findAllInstances(rootVm) {
    const instances = [rootVm];
    let i = 0;
    while (i < instances.length) {
      const vm = instances[i]
      ;(vm.$children || []).forEach(child => {
        instances.push(child);
      });
      i++;
    }
    return instances
  }

  function findAllVNodes(vnode, selector) {
    const matchingNodes = [];
    const nodes = [vnode];
    while (nodes.length) {
      const node = nodes.shift();
      if (node.children) {
        const children = [...node.children].reverse();
        children.forEach(n => {
          nodes.unshift(n);
        });
      }
      if (node.child) {
        nodes.unshift(node.child._vnode);
      }
      if (matches(node, selector)) {
        matchingNodes.push(node);
      }
    }

    return matchingNodes
  }

  function removeDuplicateNodes(vNodes) {
    const vNodeElms = vNodes.map(vNode => vNode.elm);
    return vNodes.filter((vNode, index) => index === vNodeElms.indexOf(vNode.elm))
  }

  function find(
    root,
    vm,
    selector
  ) {
    if (root instanceof Element && selector.type !== DOM_SELECTOR) {
      throwError(
        `cannot find a Vue instance on a DOM node. The node ` +
          `you are calling find on does not exist in the ` +
          `VDom. Are you adding the node as innerHTML?`
      );
    }

    if (
      selector.type === COMPONENT_SELECTOR &&
      (selector.value.functional ||
        (selector.value.options && selector.value.options.functional)) &&
      VUE_VERSION < 2.3
    ) {
      throwError(
        `find for functional components is not supported ` + `in Vue < 2.3`
      );
    }

    if (root instanceof Element) {
      return findDOMNodes(root, selector.value)
    }

    if (!root && selector.type !== DOM_SELECTOR) {
      throwError(
        `cannot find a Vue instance on a DOM node. The node ` +
          `you are calling find on does not exist in the ` +
          `VDom. Are you adding the node as innerHTML?`
      );
    }

    if (!vm && selector.type === REF_SELECTOR) {
      throwError(`$ref selectors can only be used on Vue component ` + `wrappers`);
    }

    if (vm && vm.$refs && selector.value.ref in vm.$refs) {
      const refs = vm.$refs[selector.value.ref];
      return Array.isArray(refs) ? refs : [refs]
    }

    const nodes = findAllVNodes(root, selector);
    const dedupedNodes = removeDuplicateNodes(nodes);

    if (nodes.length > 0 || selector.type !== DOM_SELECTOR) {
      return dedupedNodes
    }

    // Fallback in case element exists in HTML, but not in vnode tree
    // (e.g. if innerHTML is set as a domProp)
    return findDOMNodes(root.elm, selector.value)
  }

  function errorHandler(errorOrString, vm, info) {
    const error =
      typeof errorOrString === 'object' ? errorOrString : new Error(errorOrString);

    // If a user defined errorHandler was register via createLocalVue
    // find and call the user defined errorHandler
    const instancedErrorHandlers = findAllParentInstances(vm)
      .filter(
        _vm =>
          _vm &&
          _vm.$options &&
          _vm.$options.localVue &&
          _vm.$options.localVue.config &&
          _vm.$options.localVue.config.errorHandler
      )
      .map(_vm => _vm.$options.localVue.config.errorHandler);

    if (vm) {
      vm._error = error;
    }

    if (!instancedErrorHandlers.length) {
      throw error
    }
    // should be one error handler, as only once can be registered with local vue
    // regardless, if more exist (for whatever reason), invoke the other user defined error handlers
    instancedErrorHandlers.forEach(instancedErrorHandler => {
      instancedErrorHandler(error, vm, info);
    });
  }

  function throwIfInstancesThrew(vm) {
    const instancesWithError = findAllInstances(vm).filter(_vm => _vm._error);

    if (instancesWithError.length > 0) {
      throw instancesWithError[0]._error
    }
  }

  let hasWarned = false;

  // Vue swallows errors thrown by instances, even if the global error handler
  // throws. In order to throw in the test, we add an _error property to an
  // instance when it throws. Then we loop through the instances with
  // throwIfInstancesThrew and throw an error in the test context if any
  // instances threw.
  function addGlobalErrorHandler(_Vue) {
    const existingErrorHandler = _Vue.config.errorHandler;

    if (existingErrorHandler === errorHandler) {
      return
    }

    if (_Vue.config.errorHandler && !hasWarned) {
      warn(
        `Global error handler detected (Vue.config.errorHandler). \n` +
          `Vue Test Utils sets a custom error handler to throw errors ` +
          `thrown by instances. If you want this behavior in ` +
          `your tests, you must remove the global error handler.`
      );
      hasWarned = true;
    } else {
      _Vue.config.errorHandler = errorHandler;
    }
  }

  function normalizeStubs(stubs = {}) {
    if (stubs === false) {
      return false
    }
    if (isPlainObject(stubs)) {
      return stubs
    }
    if (Array.isArray(stubs)) {
      return stubs.reduce((acc, stub) => {
        if (typeof stub !== 'string') {
          throwError('each item in an options.stubs array must be a string');
        }
        acc[stub] = true;
        return acc
      }, {})
    }
    throwError('options.stubs must be an object or an Array');
  }

  function normalizeProvide(provide) {
    // Objects are not resolved in extended components in Vue < 2.5
    // https://github.com/vuejs/vue/issues/6436
    if (typeof provide === 'object' && VUE_VERSION < 2.5) {
      const obj = { ...provide };
      return () => obj
    }
    return provide
  }

  // 

  function getOption(option, config) {
    if (option === false) {
      return false
    }
    if (option || (config && keys$4(config).length > 0)) {
      if (option instanceof Function) {
        return option
      }
      if (config instanceof Function) {
        throw new Error(`Config can't be a Function.`)
      }
      return {
        ...config,
        ...option
      }
    }
  }

  function getStubs(stubs, configStubs) {
    const normalizedStubs = normalizeStubs(stubs);
    const normalizedConfigStubs = normalizeStubs(configStubs);
    return getOption(normalizedStubs, normalizedConfigStubs)
  }

  function mergeOptions(
    options,
    config
  ) {
    const mocks = (getOption(options.mocks, config.mocks));
    const methods = (getOption(options.methods, config.methods));
    if (methods && keys$4(methods).length) {
      warnDeprecated(
        'overwriting methods via the `methods` property',
        'There is no clear migration path for the `methods` property - Vue does not support arbitrarily replacement of methods, nor should VTU. To stub a complex method extract it from the component and test it in isolation. Otherwise, the suggestion is to rethink those tests'
      );
    }

    const provide = (getOption(options.provide, config.provide));
    const stubs = (getStubs(options.stubs, config.stubs));
    // $FlowIgnore
    return {
      ...options,
      provide: normalizeProvide(provide),
      stubs,
      mocks,
      methods
    }
  }

  var config = {
    stubs: {
      transition: true,
      'transition-group': true
    },
    mocks: {},
    methods: {},
    provide: {},
    showDeprecationWarnings:
      true
  };

  // 


  function warnIfNoWindow() {
    if (typeof window === 'undefined') {
      throwError(
        `window is undefined, vue-test-utils needs to be ` +
          `run in a browser environment. \n` +
          `You can run the tests in node using jsdom \n` +
          `See https://vue-test-utils.vuejs.org/guides/#browser-environment ` +
          `for more details.`
      );
    }
  }

  function polyfill() {
    // Polyfill `Element.matches()` for IE and older versions of Chrome:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
    }
  }

  var js = {exports: {}};

  var src = {};

  var javascript = {exports: {}};

  var beautifier$2 = {};

  var output = {};

  /*jshint node:true */

  var hasRequiredOutput;

  function requireOutput () {
  	if (hasRequiredOutput) return output;
  	hasRequiredOutput = 1;

  	function OutputLine(parent) {
  	  this.__parent = parent;
  	  this.__character_count = 0;
  	  // use indent_count as a marker for this.__lines that have preserved indentation
  	  this.__indent_count = -1;
  	  this.__alignment_count = 0;
  	  this.__wrap_point_index = 0;
  	  this.__wrap_point_character_count = 0;
  	  this.__wrap_point_indent_count = -1;
  	  this.__wrap_point_alignment_count = 0;

  	  this.__items = [];
  	}

  	OutputLine.prototype.clone_empty = function() {
  	  var line = new OutputLine(this.__parent);
  	  line.set_indent(this.__indent_count, this.__alignment_count);
  	  return line;
  	};

  	OutputLine.prototype.item = function(index) {
  	  if (index < 0) {
  	    return this.__items[this.__items.length + index];
  	  } else {
  	    return this.__items[index];
  	  }
  	};

  	OutputLine.prototype.has_match = function(pattern) {
  	  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
  	    if (this.__items[lastCheckedOutput].match(pattern)) {
  	      return true;
  	    }
  	  }
  	  return false;
  	};

  	OutputLine.prototype.set_indent = function(indent, alignment) {
  	  if (this.is_empty()) {
  	    this.__indent_count = indent || 0;
  	    this.__alignment_count = alignment || 0;
  	    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
  	  }
  	};

  	OutputLine.prototype._set_wrap_point = function() {
  	  if (this.__parent.wrap_line_length) {
  	    this.__wrap_point_index = this.__items.length;
  	    this.__wrap_point_character_count = this.__character_count;
  	    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
  	    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
  	  }
  	};

  	OutputLine.prototype._should_wrap = function() {
  	  return this.__wrap_point_index &&
  	    this.__character_count > this.__parent.wrap_line_length &&
  	    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
  	};

  	OutputLine.prototype._allow_wrap = function() {
  	  if (this._should_wrap()) {
  	    this.__parent.add_new_line();
  	    var next = this.__parent.current_line;
  	    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
  	    next.__items = this.__items.slice(this.__wrap_point_index);
  	    this.__items = this.__items.slice(0, this.__wrap_point_index);

  	    next.__character_count += this.__character_count - this.__wrap_point_character_count;
  	    this.__character_count = this.__wrap_point_character_count;

  	    if (next.__items[0] === " ") {
  	      next.__items.splice(0, 1);
  	      next.__character_count -= 1;
  	    }
  	    return true;
  	  }
  	  return false;
  	};

  	OutputLine.prototype.is_empty = function() {
  	  return this.__items.length === 0;
  	};

  	OutputLine.prototype.last = function() {
  	  if (!this.is_empty()) {
  	    return this.__items[this.__items.length - 1];
  	  } else {
  	    return null;
  	  }
  	};

  	OutputLine.prototype.push = function(item) {
  	  this.__items.push(item);
  	  var last_newline_index = item.lastIndexOf('\n');
  	  if (last_newline_index !== -1) {
  	    this.__character_count = item.length - last_newline_index;
  	  } else {
  	    this.__character_count += item.length;
  	  }
  	};

  	OutputLine.prototype.pop = function() {
  	  var item = null;
  	  if (!this.is_empty()) {
  	    item = this.__items.pop();
  	    this.__character_count -= item.length;
  	  }
  	  return item;
  	};


  	OutputLine.prototype._remove_indent = function() {
  	  if (this.__indent_count > 0) {
  	    this.__indent_count -= 1;
  	    this.__character_count -= this.__parent.indent_size;
  	  }
  	};

  	OutputLine.prototype._remove_wrap_indent = function() {
  	  if (this.__wrap_point_indent_count > 0) {
  	    this.__wrap_point_indent_count -= 1;
  	  }
  	};
  	OutputLine.prototype.trim = function() {
  	  while (this.last() === ' ') {
  	    this.__items.pop();
  	    this.__character_count -= 1;
  	  }
  	};

  	OutputLine.prototype.toString = function() {
  	  var result = '';
  	  if (this.is_empty()) {
  	    if (this.__parent.indent_empty_lines) {
  	      result = this.__parent.get_indent_string(this.__indent_count);
  	    }
  	  } else {
  	    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
  	    result += this.__items.join('');
  	  }
  	  return result;
  	};

  	function IndentStringCache(options, baseIndentString) {
  	  this.__cache = [''];
  	  this.__indent_size = options.indent_size;
  	  this.__indent_string = options.indent_char;
  	  if (!options.indent_with_tabs) {
  	    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
  	  }

  	  // Set to null to continue support for auto detection of base indent
  	  baseIndentString = baseIndentString || '';
  	  if (options.indent_level > 0) {
  	    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
  	  }

  	  this.__base_string = baseIndentString;
  	  this.__base_string_length = baseIndentString.length;
  	}

  	IndentStringCache.prototype.get_indent_size = function(indent, column) {
  	  var result = this.__base_string_length;
  	  column = column || 0;
  	  if (indent < 0) {
  	    result = 0;
  	  }
  	  result += indent * this.__indent_size;
  	  result += column;
  	  return result;
  	};

  	IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
  	  var result = this.__base_string;
  	  column = column || 0;
  	  if (indent_level < 0) {
  	    indent_level = 0;
  	    result = '';
  	  }
  	  column += indent_level * this.__indent_size;
  	  this.__ensure_cache(column);
  	  result += this.__cache[column];
  	  return result;
  	};

  	IndentStringCache.prototype.__ensure_cache = function(column) {
  	  while (column >= this.__cache.length) {
  	    this.__add_column();
  	  }
  	};

  	IndentStringCache.prototype.__add_column = function() {
  	  var column = this.__cache.length;
  	  var indent = 0;
  	  var result = '';
  	  if (this.__indent_size && column >= this.__indent_size) {
  	    indent = Math.floor(column / this.__indent_size);
  	    column -= indent * this.__indent_size;
  	    result = new Array(indent + 1).join(this.__indent_string);
  	  }
  	  if (column) {
  	    result += new Array(column + 1).join(' ');
  	  }

  	  this.__cache.push(result);
  	};

  	function Output(options, baseIndentString) {
  	  this.__indent_cache = new IndentStringCache(options, baseIndentString);
  	  this.raw = false;
  	  this._end_with_newline = options.end_with_newline;
  	  this.indent_size = options.indent_size;
  	  this.wrap_line_length = options.wrap_line_length;
  	  this.indent_empty_lines = options.indent_empty_lines;
  	  this.__lines = [];
  	  this.previous_line = null;
  	  this.current_line = null;
  	  this.next_line = new OutputLine(this);
  	  this.space_before_token = false;
  	  this.non_breaking_space = false;
  	  this.previous_token_wrapped = false;
  	  // initialize
  	  this.__add_outputline();
  	}

  	Output.prototype.__add_outputline = function() {
  	  this.previous_line = this.current_line;
  	  this.current_line = this.next_line.clone_empty();
  	  this.__lines.push(this.current_line);
  	};

  	Output.prototype.get_line_number = function() {
  	  return this.__lines.length;
  	};

  	Output.prototype.get_indent_string = function(indent, column) {
  	  return this.__indent_cache.get_indent_string(indent, column);
  	};

  	Output.prototype.get_indent_size = function(indent, column) {
  	  return this.__indent_cache.get_indent_size(indent, column);
  	};

  	Output.prototype.is_empty = function() {
  	  return !this.previous_line && this.current_line.is_empty();
  	};

  	Output.prototype.add_new_line = function(force_newline) {
  	  // never newline at the start of file
  	  // otherwise, newline only if we didn't just add one or we're forced
  	  if (this.is_empty() ||
  	    (!force_newline && this.just_added_newline())) {
  	    return false;
  	  }

  	  // if raw output is enabled, don't print additional newlines,
  	  // but still return True as though you had
  	  if (!this.raw) {
  	    this.__add_outputline();
  	  }
  	  return true;
  	};

  	Output.prototype.get_code = function(eol) {
  	  this.trim(true);

  	  // handle some edge cases where the last tokens
  	  // has text that ends with newline(s)
  	  var last_item = this.current_line.pop();
  	  if (last_item) {
  	    if (last_item[last_item.length - 1] === '\n') {
  	      last_item = last_item.replace(/\n+$/g, '');
  	    }
  	    this.current_line.push(last_item);
  	  }

  	  if (this._end_with_newline) {
  	    this.__add_outputline();
  	  }

  	  var sweet_code = this.__lines.join('\n');

  	  if (eol !== '\n') {
  	    sweet_code = sweet_code.replace(/[\n]/g, eol);
  	  }
  	  return sweet_code;
  	};

  	Output.prototype.set_wrap_point = function() {
  	  this.current_line._set_wrap_point();
  	};

  	Output.prototype.set_indent = function(indent, alignment) {
  	  indent = indent || 0;
  	  alignment = alignment || 0;

  	  // Next line stores alignment values
  	  this.next_line.set_indent(indent, alignment);

  	  // Never indent your first output indent at the start of the file
  	  if (this.__lines.length > 1) {
  	    this.current_line.set_indent(indent, alignment);
  	    return true;
  	  }

  	  this.current_line.set_indent();
  	  return false;
  	};

  	Output.prototype.add_raw_token = function(token) {
  	  for (var x = 0; x < token.newlines; x++) {
  	    this.__add_outputline();
  	  }
  	  this.current_line.set_indent(-1);
  	  this.current_line.push(token.whitespace_before);
  	  this.current_line.push(token.text);
  	  this.space_before_token = false;
  	  this.non_breaking_space = false;
  	  this.previous_token_wrapped = false;
  	};

  	Output.prototype.add_token = function(printable_token) {
  	  this.__add_space_before_token();
  	  this.current_line.push(printable_token);
  	  this.space_before_token = false;
  	  this.non_breaking_space = false;
  	  this.previous_token_wrapped = this.current_line._allow_wrap();
  	};

  	Output.prototype.__add_space_before_token = function() {
  	  if (this.space_before_token && !this.just_added_newline()) {
  	    if (!this.non_breaking_space) {
  	      this.set_wrap_point();
  	    }
  	    this.current_line.push(' ');
  	  }
  	};

  	Output.prototype.remove_indent = function(index) {
  	  var output_length = this.__lines.length;
  	  while (index < output_length) {
  	    this.__lines[index]._remove_indent();
  	    index++;
  	  }
  	  this.current_line._remove_wrap_indent();
  	};

  	Output.prototype.trim = function(eat_newlines) {
  	  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

  	  this.current_line.trim();

  	  while (eat_newlines && this.__lines.length > 1 &&
  	    this.current_line.is_empty()) {
  	    this.__lines.pop();
  	    this.current_line = this.__lines[this.__lines.length - 1];
  	    this.current_line.trim();
  	  }

  	  this.previous_line = this.__lines.length > 1 ?
  	    this.__lines[this.__lines.length - 2] : null;
  	};

  	Output.prototype.just_added_newline = function() {
  	  return this.current_line.is_empty();
  	};

  	Output.prototype.just_added_blankline = function() {
  	  return this.is_empty() ||
  	    (this.current_line.is_empty() && this.previous_line.is_empty());
  	};

  	Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
  	  var index = this.__lines.length - 2;
  	  while (index >= 0) {
  	    var potentialEmptyLine = this.__lines[index];
  	    if (potentialEmptyLine.is_empty()) {
  	      break;
  	    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
  	      potentialEmptyLine.item(-1) !== ends_with) {
  	      this.__lines.splice(index + 1, 0, new OutputLine(this));
  	      this.previous_line = this.__lines[this.__lines.length - 2];
  	      break;
  	    }
  	    index--;
  	  }
  	};

  	output.Output = Output;
  	return output;
  }

  var token = {};

  /*jshint node:true */

  var hasRequiredToken;

  function requireToken () {
  	if (hasRequiredToken) return token;
  	hasRequiredToken = 1;

  	function Token(type, text, newlines, whitespace_before) {
  	  this.type = type;
  	  this.text = text;

  	  // comments_before are
  	  // comments that have a new line before them
  	  // and may or may not have a newline after
  	  // this is a set of comments before
  	  this.comments_before = null; /* inline comment*/


  	  // this.comments_after =  new TokenStream(); // no new line before and newline after
  	  this.newlines = newlines || 0;
  	  this.whitespace_before = whitespace_before || '';
  	  this.parent = null;
  	  this.next = null;
  	  this.previous = null;
  	  this.opened = null;
  	  this.closed = null;
  	  this.directives = null;
  	}


  	token.Token = Token;
  	return token;
  }

  var acorn = {};

  /* jshint node: true, curly: false */

  var hasRequiredAcorn;

  function requireAcorn () {
  	if (hasRequiredAcorn) return acorn;
  	hasRequiredAcorn = 1;
  	(function (exports) {

  		// acorn used char codes to squeeze the last bit of performance out
  		// Beautifier is okay without that, so we're using regex
  		// permit # (23), $ (36), and @ (64). @ is used in ES7 decorators.
  		// 65 through 91 are uppercase letters.
  		// permit _ (95).
  		// 97 through 123 are lowercase letters.
  		var baseASCIIidentifierStartChars = "\\x23\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";

  		// inside an identifier @ is not allowed but 0-9 are.
  		var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";

  		// Big ugly regular expressions that match characters in the
  		// whitespace, identifier, and identifier-start categories. These
  		// are only applied when a character is found to actually have a
  		// code point above 128.
  		var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
  		var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
  		//var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  		//var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  		var identifierStart = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
  		var identifierChars = "(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";

  		exports.identifier = new RegExp(identifierStart + identifierChars, 'g');
  		exports.identifierStart = new RegExp(identifierStart);
  		exports.identifierMatch = new RegExp("(?:\\\\u[0-9a-fA-F]{4}|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");

  		// Whether a single character denotes a newline.

  		exports.newline = /[\n\r\u2028\u2029]/;

  		// Matches a whole line break (where CRLF is considered a single
  		// line break). Used to count lines.

  		// in javascript, these two differ
  		// in python they are the same, different methods are called on them
  		exports.lineBreak = new RegExp('\r\n|' + exports.newline.source);
  		exports.allLineBreaks = new RegExp(exports.lineBreak.source, 'g'); 
  	} (acorn));
  	return acorn;
  }

  var options$3 = {};

  var options$2 = {};

  /*jshint node:true */

  var hasRequiredOptions$3;

  function requireOptions$3 () {
  	if (hasRequiredOptions$3) return options$2;
  	hasRequiredOptions$3 = 1;

  	function Options(options, merge_child_field) {
  	  this.raw_options = _mergeOpts(options, merge_child_field);

  	  // Support passing the source text back with no change
  	  this.disabled = this._get_boolean('disabled');

  	  this.eol = this._get_characters('eol', 'auto');
  	  this.end_with_newline = this._get_boolean('end_with_newline');
  	  this.indent_size = this._get_number('indent_size', 4);
  	  this.indent_char = this._get_characters('indent_char', ' ');
  	  this.indent_level = this._get_number('indent_level');

  	  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
  	  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
  	  if (!this.preserve_newlines) {
  	    this.max_preserve_newlines = 0;
  	  }

  	  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
  	  if (this.indent_with_tabs) {
  	    this.indent_char = '\t';

  	    // indent_size behavior changed after 1.8.6
  	    // It used to be that indent_size would be
  	    // set to 1 for indent_with_tabs. That is no longer needed and
  	    // actually doesn't make sense - why not use spaces? Further,
  	    // that might produce unexpected behavior - tabs being used
  	    // for single-column alignment. So, when indent_with_tabs is true
  	    // and indent_size is 1, reset indent_size to 4.
  	    if (this.indent_size === 1) {
  	      this.indent_size = 4;
  	    }
  	  }

  	  // Backwards compat with 1.3.x
  	  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

  	  this.indent_empty_lines = this._get_boolean('indent_empty_lines');

  	  // valid templating languages ['django', 'erb', 'handlebars', 'php', 'smarty']
  	  // For now, 'auto' = all off for javascript, all on for html (and inline javascript).
  	  // other values ignored
  	  this.templating = this._get_selection_list('templating', ['auto', 'none', 'django', 'erb', 'handlebars', 'php', 'smarty'], ['auto']);
  	}

  	Options.prototype._get_array = function(name, default_value) {
  	  var option_value = this.raw_options[name];
  	  var result = default_value || [];
  	  if (typeof option_value === 'object') {
  	    if (option_value !== null && typeof option_value.concat === 'function') {
  	      result = option_value.concat();
  	    }
  	  } else if (typeof option_value === 'string') {
  	    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
  	  }
  	  return result;
  	};

  	Options.prototype._get_boolean = function(name, default_value) {
  	  var option_value = this.raw_options[name];
  	  var result = option_value === undefined ? !!default_value : !!option_value;
  	  return result;
  	};

  	Options.prototype._get_characters = function(name, default_value) {
  	  var option_value = this.raw_options[name];
  	  var result = default_value || '';
  	  if (typeof option_value === 'string') {
  	    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
  	  }
  	  return result;
  	};

  	Options.prototype._get_number = function(name, default_value) {
  	  var option_value = this.raw_options[name];
  	  default_value = parseInt(default_value, 10);
  	  if (isNaN(default_value)) {
  	    default_value = 0;
  	  }
  	  var result = parseInt(option_value, 10);
  	  if (isNaN(result)) {
  	    result = default_value;
  	  }
  	  return result;
  	};

  	Options.prototype._get_selection = function(name, selection_list, default_value) {
  	  var result = this._get_selection_list(name, selection_list, default_value);
  	  if (result.length !== 1) {
  	    throw new Error(
  	      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
  	      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  	  }

  	  return result[0];
  	};


  	Options.prototype._get_selection_list = function(name, selection_list, default_value) {
  	  if (!selection_list || selection_list.length === 0) {
  	    throw new Error("Selection list cannot be empty.");
  	  }

  	  default_value = default_value || [selection_list[0]];
  	  if (!this._is_valid_selection(default_value, selection_list)) {
  	    throw new Error("Invalid Default Value!");
  	  }

  	  var result = this._get_array(name, default_value);
  	  if (!this._is_valid_selection(result, selection_list)) {
  	    throw new Error(
  	      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
  	      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
  	  }

  	  return result;
  	};

  	Options.prototype._is_valid_selection = function(result, selection_list) {
  	  return result.length && selection_list.length &&
  	    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
  	};


  	// merges child options up with the parent options object
  	// Example: obj = {a: 1, b: {a: 2}}
  	//          mergeOpts(obj, 'b')
  	//
  	//          Returns: {a: 2}
  	function _mergeOpts(allOptions, childFieldName) {
  	  var finalOpts = {};
  	  allOptions = _normalizeOpts(allOptions);
  	  var name;

  	  for (name in allOptions) {
  	    if (name !== childFieldName) {
  	      finalOpts[name] = allOptions[name];
  	    }
  	  }

  	  //merge in the per type settings for the childFieldName
  	  if (childFieldName && allOptions[childFieldName]) {
  	    for (name in allOptions[childFieldName]) {
  	      finalOpts[name] = allOptions[childFieldName][name];
  	    }
  	  }
  	  return finalOpts;
  	}

  	function _normalizeOpts(options) {
  	  var convertedOpts = {};
  	  var key;

  	  for (key in options) {
  	    var newKey = key.replace(/-/g, "_");
  	    convertedOpts[newKey] = options[key];
  	  }
  	  return convertedOpts;
  	}

  	options$2.Options = Options;
  	options$2.normalizeOpts = _normalizeOpts;
  	options$2.mergeOpts = _mergeOpts;
  	return options$2;
  }

  /*jshint node:true */

  var hasRequiredOptions$2;

  function requireOptions$2 () {
  	if (hasRequiredOptions$2) return options$3;
  	hasRequiredOptions$2 = 1;

  	var BaseOptions = requireOptions$3().Options;

  	var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

  	function Options(options) {
  	  BaseOptions.call(this, options, 'js');

  	  // compatibility, re
  	  var raw_brace_style = this.raw_options.brace_style || null;
  	  if (raw_brace_style === "expand-strict") { //graceful handling of deprecated option
  	    this.raw_options.brace_style = "expand";
  	  } else if (raw_brace_style === "collapse-preserve-inline") { //graceful handling of deprecated option
  	    this.raw_options.brace_style = "collapse,preserve-inline";
  	  } else if (this.raw_options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
  	    this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
  	    // } else if (!raw_brace_style) { //Nothing exists to set it
  	    //   raw_brace_style = "collapse";
  	  }

  	  //preserve-inline in delimited string will trigger brace_preserve_inline, everything
  	  //else is considered a brace_style and the last one only will have an effect

  	  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);

  	  this.brace_preserve_inline = false; //Defaults in case one or other was not specified in meta-option
  	  this.brace_style = "collapse";

  	  for (var bs = 0; bs < brace_style_split.length; bs++) {
  	    if (brace_style_split[bs] === "preserve-inline") {
  	      this.brace_preserve_inline = true;
  	    } else {
  	      this.brace_style = brace_style_split[bs];
  	    }
  	  }

  	  this.unindent_chained_methods = this._get_boolean('unindent_chained_methods');
  	  this.break_chained_methods = this._get_boolean('break_chained_methods');
  	  this.space_in_paren = this._get_boolean('space_in_paren');
  	  this.space_in_empty_paren = this._get_boolean('space_in_empty_paren');
  	  this.jslint_happy = this._get_boolean('jslint_happy');
  	  this.space_after_anon_function = this._get_boolean('space_after_anon_function');
  	  this.space_after_named_function = this._get_boolean('space_after_named_function');
  	  this.keep_array_indentation = this._get_boolean('keep_array_indentation');
  	  this.space_before_conditional = this._get_boolean('space_before_conditional', true);
  	  this.unescape_strings = this._get_boolean('unescape_strings');
  	  this.e4x = this._get_boolean('e4x');
  	  this.comma_first = this._get_boolean('comma_first');
  	  this.operator_position = this._get_selection('operator_position', validPositionValues);

  	  // For testing of beautify preserve:start directive
  	  this.test_output_raw = this._get_boolean('test_output_raw');

  	  // force this._options.space_after_anon_function to true if this._options.jslint_happy
  	  if (this.jslint_happy) {
  	    this.space_after_anon_function = true;
  	  }

  	}
  	Options.prototype = new BaseOptions();



  	options$3.Options = Options;
  	return options$3;
  }

  var tokenizer$2 = {};

  var inputscanner = {};

  /*jshint node:true */

  var hasRequiredInputscanner;

  function requireInputscanner () {
  	if (hasRequiredInputscanner) return inputscanner;
  	hasRequiredInputscanner = 1;

  	var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

  	function InputScanner(input_string) {
  	  this.__input = input_string || '';
  	  this.__input_length = this.__input.length;
  	  this.__position = 0;
  	}

  	InputScanner.prototype.restart = function() {
  	  this.__position = 0;
  	};

  	InputScanner.prototype.back = function() {
  	  if (this.__position > 0) {
  	    this.__position -= 1;
  	  }
  	};

  	InputScanner.prototype.hasNext = function() {
  	  return this.__position < this.__input_length;
  	};

  	InputScanner.prototype.next = function() {
  	  var val = null;
  	  if (this.hasNext()) {
  	    val = this.__input.charAt(this.__position);
  	    this.__position += 1;
  	  }
  	  return val;
  	};

  	InputScanner.prototype.peek = function(index) {
  	  var val = null;
  	  index = index || 0;
  	  index += this.__position;
  	  if (index >= 0 && index < this.__input_length) {
  	    val = this.__input.charAt(index);
  	  }
  	  return val;
  	};

  	// This is a JavaScript only helper function (not in python)
  	// Javascript doesn't have a match method
  	// and not all implementation support "sticky" flag.
  	// If they do not support sticky then both this.match() and this.test() method
  	// must get the match and check the index of the match.
  	// If sticky is supported and set, this method will use it.
  	// Otherwise it will check that global is set, and fall back to the slower method.
  	InputScanner.prototype.__match = function(pattern, index) {
  	  pattern.lastIndex = index;
  	  var pattern_match = pattern.exec(this.__input);

  	  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
  	    if (pattern_match.index !== index) {
  	      pattern_match = null;
  	    }
  	  }

  	  return pattern_match;
  	};

  	InputScanner.prototype.test = function(pattern, index) {
  	  index = index || 0;
  	  index += this.__position;

  	  if (index >= 0 && index < this.__input_length) {
  	    return !!this.__match(pattern, index);
  	  } else {
  	    return false;
  	  }
  	};

  	InputScanner.prototype.testChar = function(pattern, index) {
  	  // test one character regex match
  	  var val = this.peek(index);
  	  pattern.lastIndex = 0;
  	  return val !== null && pattern.test(val);
  	};

  	InputScanner.prototype.match = function(pattern) {
  	  var pattern_match = this.__match(pattern, this.__position);
  	  if (pattern_match) {
  	    this.__position += pattern_match[0].length;
  	  } else {
  	    pattern_match = null;
  	  }
  	  return pattern_match;
  	};

  	InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
  	  var val = '';
  	  var match;
  	  if (starting_pattern) {
  	    match = this.match(starting_pattern);
  	    if (match) {
  	      val += match[0];
  	    }
  	  }
  	  if (until_pattern && (match || !starting_pattern)) {
  	    val += this.readUntil(until_pattern, until_after);
  	  }
  	  return val;
  	};

  	InputScanner.prototype.readUntil = function(pattern, until_after) {
  	  var val = '';
  	  var match_index = this.__position;
  	  pattern.lastIndex = this.__position;
  	  var pattern_match = pattern.exec(this.__input);
  	  if (pattern_match) {
  	    match_index = pattern_match.index;
  	    if (until_after) {
  	      match_index += pattern_match[0].length;
  	    }
  	  } else {
  	    match_index = this.__input_length;
  	  }

  	  val = this.__input.substring(this.__position, match_index);
  	  this.__position = match_index;
  	  return val;
  	};

  	InputScanner.prototype.readUntilAfter = function(pattern) {
  	  return this.readUntil(pattern, true);
  	};

  	InputScanner.prototype.get_regexp = function(pattern, match_from) {
  	  var result = null;
  	  var flags = 'g';
  	  if (match_from && regexp_has_sticky) {
  	    flags = 'y';
  	  }
  	  // strings are converted to regexp
  	  if (typeof pattern === "string" && pattern !== '') {
  	    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
  	    result = new RegExp(pattern, flags);
  	  } else if (pattern) {
  	    result = new RegExp(pattern.source, flags);
  	  }
  	  return result;
  	};

  	InputScanner.prototype.get_literal_regexp = function(literal_string) {
  	  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  	};

  	/* css beautifier legacy helpers */
  	InputScanner.prototype.peekUntilAfter = function(pattern) {
  	  var start = this.__position;
  	  var val = this.readUntilAfter(pattern);
  	  this.__position = start;
  	  return val;
  	};

  	InputScanner.prototype.lookBack = function(testVal) {
  	  var start = this.__position - 1;
  	  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
  	    .toLowerCase() === testVal;
  	};

  	inputscanner.InputScanner = InputScanner;
  	return inputscanner;
  }

  var tokenizer$1 = {};

  var tokenstream = {};

  /*jshint node:true */

  var hasRequiredTokenstream;

  function requireTokenstream () {
  	if (hasRequiredTokenstream) return tokenstream;
  	hasRequiredTokenstream = 1;

  	function TokenStream(parent_token) {
  	  // private
  	  this.__tokens = [];
  	  this.__tokens_length = this.__tokens.length;
  	  this.__position = 0;
  	  this.__parent_token = parent_token;
  	}

  	TokenStream.prototype.restart = function() {
  	  this.__position = 0;
  	};

  	TokenStream.prototype.isEmpty = function() {
  	  return this.__tokens_length === 0;
  	};

  	TokenStream.prototype.hasNext = function() {
  	  return this.__position < this.__tokens_length;
  	};

  	TokenStream.prototype.next = function() {
  	  var val = null;
  	  if (this.hasNext()) {
  	    val = this.__tokens[this.__position];
  	    this.__position += 1;
  	  }
  	  return val;
  	};

  	TokenStream.prototype.peek = function(index) {
  	  var val = null;
  	  index = index || 0;
  	  index += this.__position;
  	  if (index >= 0 && index < this.__tokens_length) {
  	    val = this.__tokens[index];
  	  }
  	  return val;
  	};

  	TokenStream.prototype.add = function(token) {
  	  if (this.__parent_token) {
  	    token.parent = this.__parent_token;
  	  }
  	  this.__tokens.push(token);
  	  this.__tokens_length += 1;
  	};

  	tokenstream.TokenStream = TokenStream;
  	return tokenstream;
  }

  var whitespacepattern = {};

  var pattern = {};

  /*jshint node:true */

  var hasRequiredPattern;

  function requirePattern () {
  	if (hasRequiredPattern) return pattern;
  	hasRequiredPattern = 1;

  	function Pattern(input_scanner, parent) {
  	  this._input = input_scanner;
  	  this._starting_pattern = null;
  	  this._match_pattern = null;
  	  this._until_pattern = null;
  	  this._until_after = false;

  	  if (parent) {
  	    this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
  	    this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
  	    this._until_pattern = this._input.get_regexp(parent._until_pattern);
  	    this._until_after = parent._until_after;
  	  }
  	}

  	Pattern.prototype.read = function() {
  	  var result = this._input.read(this._starting_pattern);
  	  if (!this._starting_pattern || result) {
  	    result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
  	  }
  	  return result;
  	};

  	Pattern.prototype.read_match = function() {
  	  return this._input.match(this._match_pattern);
  	};

  	Pattern.prototype.until_after = function(pattern) {
  	  var result = this._create();
  	  result._until_after = true;
  	  result._until_pattern = this._input.get_regexp(pattern);
  	  result._update();
  	  return result;
  	};

  	Pattern.prototype.until = function(pattern) {
  	  var result = this._create();
  	  result._until_after = false;
  	  result._until_pattern = this._input.get_regexp(pattern);
  	  result._update();
  	  return result;
  	};

  	Pattern.prototype.starting_with = function(pattern) {
  	  var result = this._create();
  	  result._starting_pattern = this._input.get_regexp(pattern, true);
  	  result._update();
  	  return result;
  	};

  	Pattern.prototype.matching = function(pattern) {
  	  var result = this._create();
  	  result._match_pattern = this._input.get_regexp(pattern, true);
  	  result._update();
  	  return result;
  	};

  	Pattern.prototype._create = function() {
  	  return new Pattern(this._input, this);
  	};

  	Pattern.prototype._update = function() {};

  	pattern.Pattern = Pattern;
  	return pattern;
  }

  /*jshint node:true */

  var hasRequiredWhitespacepattern;

  function requireWhitespacepattern () {
  	if (hasRequiredWhitespacepattern) return whitespacepattern;
  	hasRequiredWhitespacepattern = 1;

  	var Pattern = requirePattern().Pattern;

  	function WhitespacePattern(input_scanner, parent) {
  	  Pattern.call(this, input_scanner, parent);
  	  if (parent) {
  	    this._line_regexp = this._input.get_regexp(parent._line_regexp);
  	  } else {
  	    this.__set_whitespace_patterns('', '');
  	  }

  	  this.newline_count = 0;
  	  this.whitespace_before_token = '';
  	}
  	WhitespacePattern.prototype = new Pattern();

  	WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
  	  whitespace_chars += '\\t ';
  	  newline_chars += '\\n\\r';

  	  this._match_pattern = this._input.get_regexp(
  	    '[' + whitespace_chars + newline_chars + ']+', true);
  	  this._newline_regexp = this._input.get_regexp(
  	    '\\r\\n|[' + newline_chars + ']');
  	};

  	WhitespacePattern.prototype.read = function() {
  	  this.newline_count = 0;
  	  this.whitespace_before_token = '';

  	  var resulting_string = this._input.read(this._match_pattern);
  	  if (resulting_string === ' ') {
  	    this.whitespace_before_token = ' ';
  	  } else if (resulting_string) {
  	    var matches = this.__split(this._newline_regexp, resulting_string);
  	    this.newline_count = matches.length - 1;
  	    this.whitespace_before_token = matches[this.newline_count];
  	  }

  	  return resulting_string;
  	};

  	WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
  	  var result = this._create();
  	  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
  	  result._update();
  	  return result;
  	};

  	WhitespacePattern.prototype._create = function() {
  	  return new WhitespacePattern(this._input, this);
  	};

  	WhitespacePattern.prototype.__split = function(regexp, input_string) {
  	  regexp.lastIndex = 0;
  	  var start_index = 0;
  	  var result = [];
  	  var next_match = regexp.exec(input_string);
  	  while (next_match) {
  	    result.push(input_string.substring(start_index, next_match.index));
  	    start_index = next_match.index + next_match[0].length;
  	    next_match = regexp.exec(input_string);
  	  }

  	  if (start_index < input_string.length) {
  	    result.push(input_string.substring(start_index, input_string.length));
  	  } else {
  	    result.push('');
  	  }

  	  return result;
  	};



  	whitespacepattern.WhitespacePattern = WhitespacePattern;
  	return whitespacepattern;
  }

  /*jshint node:true */

  var hasRequiredTokenizer$2;

  function requireTokenizer$2 () {
  	if (hasRequiredTokenizer$2) return tokenizer$1;
  	hasRequiredTokenizer$2 = 1;

  	var InputScanner = requireInputscanner().InputScanner;
  	var Token = requireToken().Token;
  	var TokenStream = requireTokenstream().TokenStream;
  	var WhitespacePattern = requireWhitespacepattern().WhitespacePattern;

  	var TOKEN = {
  	  START: 'TK_START',
  	  RAW: 'TK_RAW',
  	  EOF: 'TK_EOF'
  	};

  	var Tokenizer = function(input_string, options) {
  	  this._input = new InputScanner(input_string);
  	  this._options = options || {};
  	  this.__tokens = null;

  	  this._patterns = {};
  	  this._patterns.whitespace = new WhitespacePattern(this._input);
  	};

  	Tokenizer.prototype.tokenize = function() {
  	  this._input.restart();
  	  this.__tokens = new TokenStream();

  	  this._reset();

  	  var current;
  	  var previous = new Token(TOKEN.START, '');
  	  var open_token = null;
  	  var open_stack = [];
  	  var comments = new TokenStream();

  	  while (previous.type !== TOKEN.EOF) {
  	    current = this._get_next_token(previous, open_token);
  	    while (this._is_comment(current)) {
  	      comments.add(current);
  	      current = this._get_next_token(previous, open_token);
  	    }

  	    if (!comments.isEmpty()) {
  	      current.comments_before = comments;
  	      comments = new TokenStream();
  	    }

  	    current.parent = open_token;

  	    if (this._is_opening(current)) {
  	      open_stack.push(open_token);
  	      open_token = current;
  	    } else if (open_token && this._is_closing(current, open_token)) {
  	      current.opened = open_token;
  	      open_token.closed = current;
  	      open_token = open_stack.pop();
  	      current.parent = open_token;
  	    }

  	    current.previous = previous;
  	    previous.next = current;

  	    this.__tokens.add(current);
  	    previous = current;
  	  }

  	  return this.__tokens;
  	};


  	Tokenizer.prototype._is_first_token = function() {
  	  return this.__tokens.isEmpty();
  	};

  	Tokenizer.prototype._reset = function() {};

  	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  	  this._readWhitespace();
  	  var resulting_string = this._input.read(/.+/g);
  	  if (resulting_string) {
  	    return this._create_token(TOKEN.RAW, resulting_string);
  	  } else {
  	    return this._create_token(TOKEN.EOF, '');
  	  }
  	};

  	Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  	  return false;
  	};

  	Tokenizer.prototype._is_opening = function(current_token) { // jshint unused:false
  	  return false;
  	};

  	Tokenizer.prototype._is_closing = function(current_token, open_token) { // jshint unused:false
  	  return false;
  	};

  	Tokenizer.prototype._create_token = function(type, text) {
  	  var token = new Token(type, text,
  	    this._patterns.whitespace.newline_count,
  	    this._patterns.whitespace.whitespace_before_token);
  	  return token;
  	};

  	Tokenizer.prototype._readWhitespace = function() {
  	  return this._patterns.whitespace.read();
  	};



  	tokenizer$1.Tokenizer = Tokenizer;
  	tokenizer$1.TOKEN = TOKEN;
  	return tokenizer$1;
  }

  var directives = {};

  /*jshint node:true */

  var hasRequiredDirectives;

  function requireDirectives () {
  	if (hasRequiredDirectives) return directives;
  	hasRequiredDirectives = 1;

  	function Directives(start_block_pattern, end_block_pattern) {
  	  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
  	  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
  	  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
  	  this.__directive_pattern = / (\w+)[:](\w+)/g;

  	  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
  	}

  	Directives.prototype.get_directives = function(text) {
  	  if (!text.match(this.__directives_block_pattern)) {
  	    return null;
  	  }

  	  var directives = {};
  	  this.__directive_pattern.lastIndex = 0;
  	  var directive_match = this.__directive_pattern.exec(text);

  	  while (directive_match) {
  	    directives[directive_match[1]] = directive_match[2];
  	    directive_match = this.__directive_pattern.exec(text);
  	  }

  	  return directives;
  	};

  	Directives.prototype.readIgnored = function(input) {
  	  return input.readUntilAfter(this.__directives_end_ignore_pattern);
  	};


  	directives.Directives = Directives;
  	return directives;
  }

  var templatablepattern = {};

  /*jshint node:true */

  var hasRequiredTemplatablepattern;

  function requireTemplatablepattern () {
  	if (hasRequiredTemplatablepattern) return templatablepattern;
  	hasRequiredTemplatablepattern = 1;

  	var Pattern = requirePattern().Pattern;


  	var template_names = {
  	  django: false,
  	  erb: false,
  	  handlebars: false,
  	  php: false,
  	  smarty: false
  	};

  	// This lets templates appear anywhere we would do a readUntil
  	// The cost is higher but it is pay to play.
  	function TemplatablePattern(input_scanner, parent) {
  	  Pattern.call(this, input_scanner, parent);
  	  this.__template_pattern = null;
  	  this._disabled = Object.assign({}, template_names);
  	  this._excluded = Object.assign({}, template_names);

  	  if (parent) {
  	    this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
  	    this._excluded = Object.assign(this._excluded, parent._excluded);
  	    this._disabled = Object.assign(this._disabled, parent._disabled);
  	  }
  	  var pattern = new Pattern(input_scanner);
  	  this.__patterns = {
  	    handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
  	    handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
  	    handlebars: pattern.starting_with(/{{/).until_after(/}}/),
  	    php: pattern.starting_with(/<\?(?:[= ]|php)/).until_after(/\?>/),
  	    erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
  	    // django coflicts with handlebars a bit.
  	    django: pattern.starting_with(/{%/).until_after(/%}/),
  	    django_value: pattern.starting_with(/{{/).until_after(/}}/),
  	    django_comment: pattern.starting_with(/{#/).until_after(/#}/),
  	    smarty: pattern.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),
  	    smarty_comment: pattern.starting_with(/{\*/).until_after(/\*}/),
  	    smarty_literal: pattern.starting_with(/{literal}/).until_after(/{\/literal}/)
  	  };
  	}
  	TemplatablePattern.prototype = new Pattern();

  	TemplatablePattern.prototype._create = function() {
  	  return new TemplatablePattern(this._input, this);
  	};

  	TemplatablePattern.prototype._update = function() {
  	  this.__set_templated_pattern();
  	};

  	TemplatablePattern.prototype.disable = function(language) {
  	  var result = this._create();
  	  result._disabled[language] = true;
  	  result._update();
  	  return result;
  	};

  	TemplatablePattern.prototype.read_options = function(options) {
  	  var result = this._create();
  	  for (var language in template_names) {
  	    result._disabled[language] = options.templating.indexOf(language) === -1;
  	  }
  	  result._update();
  	  return result;
  	};

  	TemplatablePattern.prototype.exclude = function(language) {
  	  var result = this._create();
  	  result._excluded[language] = true;
  	  result._update();
  	  return result;
  	};

  	TemplatablePattern.prototype.read = function() {
  	  var result = '';
  	  if (this._match_pattern) {
  	    result = this._input.read(this._starting_pattern);
  	  } else {
  	    result = this._input.read(this._starting_pattern, this.__template_pattern);
  	  }
  	  var next = this._read_template();
  	  while (next) {
  	    if (this._match_pattern) {
  	      next += this._input.read(this._match_pattern);
  	    } else {
  	      next += this._input.readUntil(this.__template_pattern);
  	    }
  	    result += next;
  	    next = this._read_template();
  	  }

  	  if (this._until_after) {
  	    result += this._input.readUntilAfter(this._until_pattern);
  	  }
  	  return result;
  	};

  	TemplatablePattern.prototype.__set_templated_pattern = function() {
  	  var items = [];

  	  if (!this._disabled.php) {
  	    items.push(this.__patterns.php._starting_pattern.source);
  	  }
  	  if (!this._disabled.handlebars) {
  	    items.push(this.__patterns.handlebars._starting_pattern.source);
  	  }
  	  if (!this._disabled.erb) {
  	    items.push(this.__patterns.erb._starting_pattern.source);
  	  }
  	  if (!this._disabled.django) {
  	    items.push(this.__patterns.django._starting_pattern.source);
  	    // The starting pattern for django is more complex because it has different
  	    // patterns for value, comment, and other sections
  	    items.push(this.__patterns.django_value._starting_pattern.source);
  	    items.push(this.__patterns.django_comment._starting_pattern.source);
  	  }
  	  if (!this._disabled.smarty) {
  	    items.push(this.__patterns.smarty._starting_pattern.source);
  	  }

  	  if (this._until_pattern) {
  	    items.push(this._until_pattern.source);
  	  }
  	  this.__template_pattern = this._input.get_regexp('(?:' + items.join('|') + ')');
  	};

  	TemplatablePattern.prototype._read_template = function() {
  	  var resulting_string = '';
  	  var c = this._input.peek();
  	  if (c === '<') {
  	    var peek1 = this._input.peek(1);
  	    //if we're in a comment, do something special
  	    // We treat all comments as literals, even more than preformatted tags
  	    // we just look for the appropriate close tag
  	    if (!this._disabled.php && !this._excluded.php && peek1 === '?') {
  	      resulting_string = resulting_string ||
  	        this.__patterns.php.read();
  	    }
  	    if (!this._disabled.erb && !this._excluded.erb && peek1 === '%') {
  	      resulting_string = resulting_string ||
  	        this.__patterns.erb.read();
  	    }
  	  } else if (c === '{') {
  	    if (!this._disabled.handlebars && !this._excluded.handlebars) {
  	      resulting_string = resulting_string ||
  	        this.__patterns.handlebars_comment.read();
  	      resulting_string = resulting_string ||
  	        this.__patterns.handlebars_unescaped.read();
  	      resulting_string = resulting_string ||
  	        this.__patterns.handlebars.read();
  	    }
  	    if (!this._disabled.django) {
  	      // django coflicts with handlebars a bit.
  	      if (!this._excluded.django && !this._excluded.handlebars) {
  	        resulting_string = resulting_string ||
  	          this.__patterns.django_value.read();
  	      }
  	      if (!this._excluded.django) {
  	        resulting_string = resulting_string ||
  	          this.__patterns.django_comment.read();
  	        resulting_string = resulting_string ||
  	          this.__patterns.django.read();
  	      }
  	    }
  	    if (!this._disabled.smarty) {
  	      // smarty cannot be enabled with django or handlebars enabled
  	      if (this._disabled.django && this._disabled.handlebars) {
  	        resulting_string = resulting_string ||
  	          this.__patterns.smarty_comment.read();
  	        resulting_string = resulting_string ||
  	          this.__patterns.smarty_literal.read();
  	        resulting_string = resulting_string ||
  	          this.__patterns.smarty.read();
  	      }
  	    }
  	  }
  	  return resulting_string;
  	};


  	templatablepattern.TemplatablePattern = TemplatablePattern;
  	return templatablepattern;
  }

  /*jshint node:true */

  var hasRequiredTokenizer$1;

  function requireTokenizer$1 () {
  	if (hasRequiredTokenizer$1) return tokenizer$2;
  	hasRequiredTokenizer$1 = 1;

  	var InputScanner = requireInputscanner().InputScanner;
  	var BaseTokenizer = requireTokenizer$2().Tokenizer;
  	var BASETOKEN = requireTokenizer$2().TOKEN;
  	var Directives = requireDirectives().Directives;
  	var acorn = requireAcorn();
  	var Pattern = requirePattern().Pattern;
  	var TemplatablePattern = requireTemplatablepattern().TemplatablePattern;


  	function in_array(what, arr) {
  	  return arr.indexOf(what) !== -1;
  	}


  	var TOKEN = {
  	  START_EXPR: 'TK_START_EXPR',
  	  END_EXPR: 'TK_END_EXPR',
  	  START_BLOCK: 'TK_START_BLOCK',
  	  END_BLOCK: 'TK_END_BLOCK',
  	  WORD: 'TK_WORD',
  	  RESERVED: 'TK_RESERVED',
  	  SEMICOLON: 'TK_SEMICOLON',
  	  STRING: 'TK_STRING',
  	  EQUALS: 'TK_EQUALS',
  	  OPERATOR: 'TK_OPERATOR',
  	  COMMA: 'TK_COMMA',
  	  BLOCK_COMMENT: 'TK_BLOCK_COMMENT',
  	  COMMENT: 'TK_COMMENT',
  	  DOT: 'TK_DOT',
  	  UNKNOWN: 'TK_UNKNOWN',
  	  START: BASETOKEN.START,
  	  RAW: BASETOKEN.RAW,
  	  EOF: BASETOKEN.EOF
  	};


  	var directives_core = new Directives(/\/\*/, /\*\//);

  	var number_pattern = /0[xX][0123456789abcdefABCDEF_]*n?|0[oO][01234567_]*n?|0[bB][01_]*n?|\d[\d_]*n|(?:\.\d[\d_]*|\d[\d_]*\.?[\d_]*)(?:[eE][+-]?[\d_]+)?/;

  	var digit = /[0-9]/;

  	// Dot "." must be distinguished from "..." and decimal
  	var dot_pattern = /[^\d\.]/;

  	var positionable_operators = (
  	  ">>> === !== &&= ??= ||= " +
  	  "<< && >= ** != == <= >> || ?? |> " +
  	  "< / - + > : & % ? ^ | *").split(' ');

  	// IMPORTANT: this must be sorted longest to shortest or tokenizing many not work.
  	// Also, you must update possitionable operators separately from punct
  	var punct =
  	  ">>>= " +
  	  "... >>= <<= === >>> !== **= &&= ??= ||= " +
  	  "=> ^= :: /= << <= == && -= >= >> != -- += ** || ?? ++ %= &= *= |= |> " +
  	  "= ! ? > < : / ^ - + * & % ~ |";

  	punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  	// ?. but not if followed by a number 
  	punct = '\\?\\.(?!\\d) ' + punct;
  	punct = punct.replace(/ /g, '|');

  	var punct_pattern = new RegExp(punct);

  	// words which should always start on new line.
  	var line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
  	var reserved_words = line_starters.concat(['do', 'in', 'of', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as', 'class', 'extends']);
  	var reserved_word_pattern = new RegExp('^(?:' + reserved_words.join('|') + ')$');

  	// var template_pattern = /(?:(?:<\?php|<\?=)[\s\S]*?\?>)|(?:<%[\s\S]*?%>)/g;

  	var in_html_comment;

  	var Tokenizer = function(input_string, options) {
  	  BaseTokenizer.call(this, input_string, options);

  	  this._patterns.whitespace = this._patterns.whitespace.matching(
  	    /\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source,
  	    /\u2028\u2029/.source);

  	  var pattern_reader = new Pattern(this._input);
  	  var templatable = new TemplatablePattern(this._input)
  	    .read_options(this._options);

  	  this.__patterns = {
  	    template: templatable,
  	    identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
  	    number: pattern_reader.matching(number_pattern),
  	    punct: pattern_reader.matching(punct_pattern),
  	    // comment ends just before nearest linefeed or end of file
  	    comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
  	    //  /* ... */ comment ends with nearest */ or end of file
  	    block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
  	    html_comment_start: pattern_reader.matching(/<!--/),
  	    html_comment_end: pattern_reader.matching(/-->/),
  	    include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
  	    shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
  	    xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[^}]+?}|!\[CDATA\[[^\]]*?\]\]|)(\s*{[^}]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{([^{}]|{[^}]+?})+?}))*\s*(\/?)\s*>/),
  	    single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
  	    double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
  	    template_text: templatable.until(/[`\\$]/),
  	    template_expression: templatable.until(/[`}\\]/)
  	  };

  	};
  	Tokenizer.prototype = new BaseTokenizer();

  	Tokenizer.prototype._is_comment = function(current_token) {
  	  return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
  	};

  	Tokenizer.prototype._is_opening = function(current_token) {
  	  return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
  	};

  	Tokenizer.prototype._is_closing = function(current_token, open_token) {
  	  return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) &&
  	    (open_token && (
  	      (current_token.text === ']' && open_token.text === '[') ||
  	      (current_token.text === ')' && open_token.text === '(') ||
  	      (current_token.text === '}' && open_token.text === '{')));
  	};

  	Tokenizer.prototype._reset = function() {
  	  in_html_comment = false;
  	};

  	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  	  var token = null;
  	  this._readWhitespace();
  	  var c = this._input.peek();

  	  if (c === null) {
  	    return this._create_token(TOKEN.EOF, '');
  	  }

  	  token = token || this._read_non_javascript(c);
  	  token = token || this._read_string(c);
  	  token = token || this._read_pair(c, this._input.peek(1)); // Issue #2062 hack for record type '#{'
  	  token = token || this._read_word(previous_token);
  	  token = token || this._read_singles(c);
  	  token = token || this._read_comment(c);
  	  token = token || this._read_regexp(c, previous_token);
  	  token = token || this._read_xml(c, previous_token);
  	  token = token || this._read_punctuation();
  	  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  	  return token;
  	};

  	Tokenizer.prototype._read_word = function(previous_token) {
  	  var resulting_string;
  	  resulting_string = this.__patterns.identifier.read();
  	  if (resulting_string !== '') {
  	    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');
  	    if (!(previous_token.type === TOKEN.DOT ||
  	        (previous_token.type === TOKEN.RESERVED && (previous_token.text === 'set' || previous_token.text === 'get'))) &&
  	      reserved_word_pattern.test(resulting_string)) {
  	      if ((resulting_string === 'in' || resulting_string === 'of') &&
  	        (previous_token.type === TOKEN.WORD || previous_token.type === TOKEN.STRING)) { // hack for 'in' and 'of' operators
  	        return this._create_token(TOKEN.OPERATOR, resulting_string);
  	      }
  	      return this._create_token(TOKEN.RESERVED, resulting_string);
  	    }
  	    return this._create_token(TOKEN.WORD, resulting_string);
  	  }

  	  resulting_string = this.__patterns.number.read();
  	  if (resulting_string !== '') {
  	    return this._create_token(TOKEN.WORD, resulting_string);
  	  }
  	};

  	Tokenizer.prototype._read_singles = function(c) {
  	  var token = null;
  	  if (c === '(' || c === '[') {
  	    token = this._create_token(TOKEN.START_EXPR, c);
  	  } else if (c === ')' || c === ']') {
  	    token = this._create_token(TOKEN.END_EXPR, c);
  	  } else if (c === '{') {
  	    token = this._create_token(TOKEN.START_BLOCK, c);
  	  } else if (c === '}') {
  	    token = this._create_token(TOKEN.END_BLOCK, c);
  	  } else if (c === ';') {
  	    token = this._create_token(TOKEN.SEMICOLON, c);
  	  } else if (c === '.' && dot_pattern.test(this._input.peek(1))) {
  	    token = this._create_token(TOKEN.DOT, c);
  	  } else if (c === ',') {
  	    token = this._create_token(TOKEN.COMMA, c);
  	  }

  	  if (token) {
  	    this._input.next();
  	  }
  	  return token;
  	};

  	Tokenizer.prototype._read_pair = function(c, d) {
  	  var token = null;
  	  if (c === '#' && d === '{') {
  	    token = this._create_token(TOKEN.START_BLOCK, c + d);
  	  }

  	  if (token) {
  	    this._input.next();
  	    this._input.next();
  	  }
  	  return token;
  	};

  	Tokenizer.prototype._read_punctuation = function() {
  	  var resulting_string = this.__patterns.punct.read();

  	  if (resulting_string !== '') {
  	    if (resulting_string === '=') {
  	      return this._create_token(TOKEN.EQUALS, resulting_string);
  	    } else if (resulting_string === '?.') {
  	      return this._create_token(TOKEN.DOT, resulting_string);
  	    } else {
  	      return this._create_token(TOKEN.OPERATOR, resulting_string);
  	    }
  	  }
  	};

  	Tokenizer.prototype._read_non_javascript = function(c) {
  	  var resulting_string = '';

  	  if (c === '#') {
  	    if (this._is_first_token()) {
  	      resulting_string = this.__patterns.shebang.read();

  	      if (resulting_string) {
  	        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
  	      }
  	    }

  	    // handles extendscript #includes
  	    resulting_string = this.__patterns.include.read();

  	    if (resulting_string) {
  	      return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
  	    }

  	    c = this._input.next();

  	    // Spidermonkey-specific sharp variables for circular references. Considered obsolete.
  	    var sharp = '#';
  	    if (this._input.hasNext() && this._input.testChar(digit)) {
  	      do {
  	        c = this._input.next();
  	        sharp += c;
  	      } while (this._input.hasNext() && c !== '#' && c !== '=');
  	      if (c === '#') ; else if (this._input.peek() === '[' && this._input.peek(1) === ']') {
  	        sharp += '[]';
  	        this._input.next();
  	        this._input.next();
  	      } else if (this._input.peek() === '{' && this._input.peek(1) === '}') {
  	        sharp += '{}';
  	        this._input.next();
  	        this._input.next();
  	      }
  	      return this._create_token(TOKEN.WORD, sharp);
  	    }

  	    this._input.back();

  	  } else if (c === '<' && this._is_first_token()) {
  	    resulting_string = this.__patterns.html_comment_start.read();
  	    if (resulting_string) {
  	      while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
  	        resulting_string += this._input.next();
  	      }
  	      in_html_comment = true;
  	      return this._create_token(TOKEN.COMMENT, resulting_string);
  	    }
  	  } else if (in_html_comment && c === '-') {
  	    resulting_string = this.__patterns.html_comment_end.read();
  	    if (resulting_string) {
  	      in_html_comment = false;
  	      return this._create_token(TOKEN.COMMENT, resulting_string);
  	    }
  	  }

  	  return null;
  	};

  	Tokenizer.prototype._read_comment = function(c) {
  	  var token = null;
  	  if (c === '/') {
  	    var comment = '';
  	    if (this._input.peek(1) === '*') {
  	      // peek for comment /* ... */
  	      comment = this.__patterns.block_comment.read();
  	      var directives = directives_core.get_directives(comment);
  	      if (directives && directives.ignore === 'start') {
  	        comment += directives_core.readIgnored(this._input);
  	      }
  	      comment = comment.replace(acorn.allLineBreaks, '\n');
  	      token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
  	      token.directives = directives;
  	    } else if (this._input.peek(1) === '/') {
  	      // peek for comment // ...
  	      comment = this.__patterns.comment.read();
  	      token = this._create_token(TOKEN.COMMENT, comment);
  	    }
  	  }
  	  return token;
  	};

  	Tokenizer.prototype._read_string = function(c) {
  	  if (c === '`' || c === "'" || c === '"') {
  	    var resulting_string = this._input.next();
  	    this.has_char_escapes = false;

  	    if (c === '`') {
  	      resulting_string += this._read_string_recursive('`', true, '${');
  	    } else {
  	      resulting_string += this._read_string_recursive(c);
  	    }

  	    if (this.has_char_escapes && this._options.unescape_strings) {
  	      resulting_string = unescape_string(resulting_string);
  	    }

  	    if (this._input.peek() === c) {
  	      resulting_string += this._input.next();
  	    }

  	    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');

  	    return this._create_token(TOKEN.STRING, resulting_string);
  	  }

  	  return null;
  	};

  	Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
  	  // regex and xml can only appear in specific locations during parsing
  	  return (previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
  	    (previous_token.type === TOKEN.END_EXPR && previous_token.text === ')' &&
  	      previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ['if', 'while', 'for'])) ||
  	    (in_array(previous_token.type, [TOKEN.COMMENT, TOKEN.START_EXPR, TOKEN.START_BLOCK, TOKEN.START,
  	      TOKEN.END_BLOCK, TOKEN.OPERATOR, TOKEN.EQUALS, TOKEN.EOF, TOKEN.SEMICOLON, TOKEN.COMMA
  	    ]));
  	};

  	Tokenizer.prototype._read_regexp = function(c, previous_token) {

  	  if (c === '/' && this._allow_regexp_or_xml(previous_token)) {
  	    // handle regexp
  	    //
  	    var resulting_string = this._input.next();
  	    var esc = false;

  	    var in_char_class = false;
  	    while (this._input.hasNext() &&
  	      ((esc || in_char_class || this._input.peek() !== c) &&
  	        !this._input.testChar(acorn.newline))) {
  	      resulting_string += this._input.peek();
  	      if (!esc) {
  	        esc = this._input.peek() === '\\';
  	        if (this._input.peek() === '[') {
  	          in_char_class = true;
  	        } else if (this._input.peek() === ']') {
  	          in_char_class = false;
  	        }
  	      } else {
  	        esc = false;
  	      }
  	      this._input.next();
  	    }

  	    if (this._input.peek() === c) {
  	      resulting_string += this._input.next();

  	      // regexps may have modifiers /regexp/MOD , so fetch those, too
  	      // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
  	      resulting_string += this._input.read(acorn.identifier);
  	    }
  	    return this._create_token(TOKEN.STRING, resulting_string);
  	  }
  	  return null;
  	};

  	Tokenizer.prototype._read_xml = function(c, previous_token) {

  	  if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
  	    var xmlStr = '';
  	    var match = this.__patterns.xml.read_match();
  	    // handle e4x xml literals
  	    //
  	    if (match) {
  	      // Trim root tag to attempt to
  	      var rootTag = match[2].replace(/^{\s+/, '{').replace(/\s+}$/, '}');
  	      var isCurlyRoot = rootTag.indexOf('{') === 0;
  	      var depth = 0;
  	      while (match) {
  	        var isEndTag = !!match[1];
  	        var tagName = match[2];
  	        var isSingletonTag = (!!match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
  	        if (!isSingletonTag &&
  	          (tagName === rootTag || (isCurlyRoot && tagName.replace(/^{\s+/, '{').replace(/\s+}$/, '}')))) {
  	          if (isEndTag) {
  	            --depth;
  	          } else {
  	            ++depth;
  	          }
  	        }
  	        xmlStr += match[0];
  	        if (depth <= 0) {
  	          break;
  	        }
  	        match = this.__patterns.xml.read_match();
  	      }
  	      // if we didn't close correctly, keep unformatted.
  	      if (!match) {
  	        xmlStr += this._input.match(/[\s\S]*/g)[0];
  	      }
  	      xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
  	      return this._create_token(TOKEN.STRING, xmlStr);
  	    }
  	  }

  	  return null;
  	};

  	function unescape_string(s) {
  	  // You think that a regex would work for this
  	  // return s.replace(/\\x([0-9a-f]{2})/gi, function(match, val) {
  	  //         return String.fromCharCode(parseInt(val, 16));
  	  //     })
  	  // However, dealing with '\xff', '\\xff', '\\\xff' makes this more fun.
  	  var out = '',
  	    escaped = 0;

  	  var input_scan = new InputScanner(s);
  	  var matched = null;

  	  while (input_scan.hasNext()) {
  	    // Keep any whitespace, non-slash characters
  	    // also keep slash pairs.
  	    matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);

  	    if (matched) {
  	      out += matched[0];
  	    }

  	    if (input_scan.peek() === '\\') {
  	      input_scan.next();
  	      if (input_scan.peek() === 'x') {
  	        matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
  	      } else if (input_scan.peek() === 'u') {
  	        matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
  	      } else {
  	        out += '\\';
  	        if (input_scan.hasNext()) {
  	          out += input_scan.next();
  	        }
  	        continue;
  	      }

  	      // If there's some error decoding, return the original string
  	      if (!matched) {
  	        return s;
  	      }

  	      escaped = parseInt(matched[1], 16);

  	      if (escaped > 0x7e && escaped <= 0xff && matched[0].indexOf('x') === 0) {
  	        // we bail out on \x7f..\xff,
  	        // leaving whole string escaped,
  	        // as it's probably completely binary
  	        return s;
  	      } else if (escaped >= 0x00 && escaped < 0x20) {
  	        // leave 0x00...0x1f escaped
  	        out += '\\' + matched[0];
  	        continue;
  	      } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
  	        // single-quote, apostrophe, backslash - escape these
  	        out += '\\' + String.fromCharCode(escaped);
  	      } else {
  	        out += String.fromCharCode(escaped);
  	      }
  	    }
  	  }

  	  return out;
  	}

  	// handle string
  	//
  	Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
  	  var current_char;
  	  var pattern;
  	  if (delimiter === '\'') {
  	    pattern = this.__patterns.single_quote;
  	  } else if (delimiter === '"') {
  	    pattern = this.__patterns.double_quote;
  	  } else if (delimiter === '`') {
  	    pattern = this.__patterns.template_text;
  	  } else if (delimiter === '}') {
  	    pattern = this.__patterns.template_expression;
  	  }

  	  var resulting_string = pattern.read();
  	  var next = '';
  	  while (this._input.hasNext()) {
  	    next = this._input.next();
  	    if (next === delimiter ||
  	      (!allow_unescaped_newlines && acorn.newline.test(next))) {
  	      this._input.back();
  	      break;
  	    } else if (next === '\\' && this._input.hasNext()) {
  	      current_char = this._input.peek();

  	      if (current_char === 'x' || current_char === 'u') {
  	        this.has_char_escapes = true;
  	      } else if (current_char === '\r' && this._input.peek(1) === '\n') {
  	        this._input.next();
  	      }
  	      next += this._input.next();
  	    } else if (start_sub) {
  	      if (start_sub === '${' && next === '$' && this._input.peek() === '{') {
  	        next += this._input.next();
  	      }

  	      if (start_sub === next) {
  	        if (delimiter === '`') {
  	          next += this._read_string_recursive('}', allow_unescaped_newlines, '`');
  	        } else {
  	          next += this._read_string_recursive('`', allow_unescaped_newlines, '${');
  	        }
  	        if (this._input.hasNext()) {
  	          next += this._input.next();
  	        }
  	      }
  	    }
  	    next += pattern.read();
  	    resulting_string += next;
  	  }

  	  return resulting_string;
  	};

  	tokenizer$2.Tokenizer = Tokenizer;
  	tokenizer$2.TOKEN = TOKEN;
  	tokenizer$2.positionable_operators = positionable_operators.slice();
  	tokenizer$2.line_starters = line_starters.slice();
  	return tokenizer$2;
  }

  /*jshint node:true */

  var hasRequiredBeautifier$2;

  function requireBeautifier$2 () {
  	if (hasRequiredBeautifier$2) return beautifier$2;
  	hasRequiredBeautifier$2 = 1;

  	var Output = requireOutput().Output;
  	var Token = requireToken().Token;
  	var acorn = requireAcorn();
  	var Options = requireOptions$2().Options;
  	var Tokenizer = requireTokenizer$1().Tokenizer;
  	var line_starters = requireTokenizer$1().line_starters;
  	var positionable_operators = requireTokenizer$1().positionable_operators;
  	var TOKEN = requireTokenizer$1().TOKEN;


  	function in_array(what, arr) {
  	  return arr.indexOf(what) !== -1;
  	}

  	function ltrim(s) {
  	  return s.replace(/^\s+/g, '');
  	}

  	function generateMapFromStrings(list) {
  	  var result = {};
  	  for (var x = 0; x < list.length; x++) {
  	    // make the mapped names underscored instead of dash
  	    result[list[x].replace(/-/g, '_')] = list[x];
  	  }
  	  return result;
  	}

  	function reserved_word(token, word) {
  	  return token && token.type === TOKEN.RESERVED && token.text === word;
  	}

  	function reserved_array(token, words) {
  	  return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
  	}
  	// Unsure of what they mean, but they work. Worth cleaning up in future.
  	var special_words = ['case', 'return', 'do', 'if', 'throw', 'else', 'await', 'break', 'continue', 'async'];

  	var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

  	// Generate map from array
  	var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);

  	var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];

  	var MODE = {
  	  BlockStatement: 'BlockStatement', // 'BLOCK'
  	  Statement: 'Statement', // 'STATEMENT'
  	  ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
  	  ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
  	  ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
  	  Conditional: 'Conditional', //'(COND-EXPRESSION)',
  	  Expression: 'Expression' //'(EXPRESSION)'
  	};

  	function remove_redundant_indentation(output, frame) {
  	  // This implementation is effective but has some issues:
  	  //     - can cause line wrap to happen too soon due to indent removal
  	  //           after wrap points are calculated
  	  // These issues are minor compared to ugly indentation.

  	  if (frame.multiline_frame ||
  	    frame.mode === MODE.ForInitializer ||
  	    frame.mode === MODE.Conditional) {
  	    return;
  	  }

  	  // remove one indent from each line inside this section
  	  output.remove_indent(frame.start_line_index);
  	}

  	// we could use just string.split, but
  	// IE doesn't like returning empty strings
  	function split_linebreaks(s) {
  	  //return s.split(/\x0d\x0a|\x0a/);

  	  s = s.replace(acorn.allLineBreaks, '\n');
  	  var out = [],
  	    idx = s.indexOf("\n");
  	  while (idx !== -1) {
  	    out.push(s.substring(0, idx));
  	    s = s.substring(idx + 1);
  	    idx = s.indexOf("\n");
  	  }
  	  if (s.length) {
  	    out.push(s);
  	  }
  	  return out;
  	}

  	function is_array(mode) {
  	  return mode === MODE.ArrayLiteral;
  	}

  	function is_expression(mode) {
  	  return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
  	}

  	function all_lines_start_with(lines, c) {
  	  for (var i = 0; i < lines.length; i++) {
  	    var line = lines[i].trim();
  	    if (line.charAt(0) !== c) {
  	      return false;
  	    }
  	  }
  	  return true;
  	}

  	function each_line_matches_indent(lines, indent) {
  	  var i = 0,
  	    len = lines.length,
  	    line;
  	  for (; i < len; i++) {
  	    line = lines[i];
  	    // allow empty lines to pass through
  	    if (line && line.indexOf(indent) !== 0) {
  	      return false;
  	    }
  	  }
  	  return true;
  	}


  	function Beautifier(source_text, options) {
  	  options = options || {};
  	  this._source_text = source_text || '';

  	  this._output = null;
  	  this._tokens = null;
  	  this._last_last_text = null;
  	  this._flags = null;
  	  this._previous_flags = null;

  	  this._flag_store = null;
  	  this._options = new Options(options);
  	}

  	Beautifier.prototype.create_flags = function(flags_base, mode) {
  	  var next_indent_level = 0;
  	  if (flags_base) {
  	    next_indent_level = flags_base.indentation_level;
  	    if (!this._output.just_added_newline() &&
  	      flags_base.line_indent_level > next_indent_level) {
  	      next_indent_level = flags_base.line_indent_level;
  	    }
  	  }

  	  var next_flags = {
  	    mode: mode,
  	    parent: flags_base,
  	    last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ''), // last token text
  	    last_word: flags_base ? flags_base.last_word : '', // last TOKEN.WORD passed
  	    declaration_statement: false,
  	    declaration_assignment: false,
  	    multiline_frame: false,
  	    inline_frame: false,
  	    if_block: false,
  	    else_block: false,
  	    class_start_block: false, // class A { INSIDE HERE } or class B extends C { INSIDE HERE }
  	    do_block: false,
  	    do_while: false,
  	    import_block: false,
  	    in_case_statement: false, // switch(..){ INSIDE HERE }
  	    in_case: false, // we're on the exact line with "case 0:"
  	    case_body: false, // the indented case-action block
  	    case_block: false, // the indented case-action block is wrapped with {}
  	    indentation_level: next_indent_level,
  	    alignment: 0,
  	    line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
  	    start_line_index: this._output.get_line_number(),
  	    ternary_depth: 0
  	  };
  	  return next_flags;
  	};

  	Beautifier.prototype._reset = function(source_text) {
  	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  	  this._last_last_text = ''; // pre-last token text
  	  this._output = new Output(this._options, baseIndentString);

  	  // If testing the ignore directive, start with output disable set to true
  	  this._output.raw = this._options.test_output_raw;


  	  // Stack of parsing/formatting states, including MODE.
  	  // We tokenize, parse, and output in an almost purely a forward-only stream of token input
  	  // and formatted output.  This makes the beautifier less accurate than full parsers
  	  // but also far more tolerant of syntax errors.
  	  //
  	  // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
  	  // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
  	  // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
  	  // most full parsers would die, but the beautifier gracefully falls back to
  	  // MODE.BlockStatement and continues on.
  	  this._flag_store = [];
  	  this.set_mode(MODE.BlockStatement);
  	  var tokenizer = new Tokenizer(source_text, this._options);
  	  this._tokens = tokenizer.tokenize();
  	  return source_text;
  	};

  	Beautifier.prototype.beautify = function() {
  	  // if disabled, return the input unchanged.
  	  if (this._options.disabled) {
  	    return this._source_text;
  	  }

  	  var sweet_code;
  	  var source_text = this._reset(this._source_text);

  	  var eol = this._options.eol;
  	  if (this._options.eol === 'auto') {
  	    eol = '\n';
  	    if (source_text && acorn.lineBreak.test(source_text || '')) {
  	      eol = source_text.match(acorn.lineBreak)[0];
  	    }
  	  }

  	  var current_token = this._tokens.next();
  	  while (current_token) {
  	    this.handle_token(current_token);

  	    this._last_last_text = this._flags.last_token.text;
  	    this._flags.last_token = current_token;

  	    current_token = this._tokens.next();
  	  }

  	  sweet_code = this._output.get_code(eol);

  	  return sweet_code;
  	};

  	Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
  	  if (current_token.type === TOKEN.START_EXPR) {
  	    this.handle_start_expr(current_token);
  	  } else if (current_token.type === TOKEN.END_EXPR) {
  	    this.handle_end_expr(current_token);
  	  } else if (current_token.type === TOKEN.START_BLOCK) {
  	    this.handle_start_block(current_token);
  	  } else if (current_token.type === TOKEN.END_BLOCK) {
  	    this.handle_end_block(current_token);
  	  } else if (current_token.type === TOKEN.WORD) {
  	    this.handle_word(current_token);
  	  } else if (current_token.type === TOKEN.RESERVED) {
  	    this.handle_word(current_token);
  	  } else if (current_token.type === TOKEN.SEMICOLON) {
  	    this.handle_semicolon(current_token);
  	  } else if (current_token.type === TOKEN.STRING) {
  	    this.handle_string(current_token);
  	  } else if (current_token.type === TOKEN.EQUALS) {
  	    this.handle_equals(current_token);
  	  } else if (current_token.type === TOKEN.OPERATOR) {
  	    this.handle_operator(current_token);
  	  } else if (current_token.type === TOKEN.COMMA) {
  	    this.handle_comma(current_token);
  	  } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
  	    this.handle_block_comment(current_token, preserve_statement_flags);
  	  } else if (current_token.type === TOKEN.COMMENT) {
  	    this.handle_comment(current_token, preserve_statement_flags);
  	  } else if (current_token.type === TOKEN.DOT) {
  	    this.handle_dot(current_token);
  	  } else if (current_token.type === TOKEN.EOF) {
  	    this.handle_eof(current_token);
  	  } else if (current_token.type === TOKEN.UNKNOWN) {
  	    this.handle_unknown(current_token, preserve_statement_flags);
  	  } else {
  	    this.handle_unknown(current_token, preserve_statement_flags);
  	  }
  	};

  	Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
  	  var newlines = current_token.newlines;
  	  var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);

  	  if (current_token.comments_before) {
  	    var comment_token = current_token.comments_before.next();
  	    while (comment_token) {
  	      // The cleanest handling of inline comments is to treat them as though they aren't there.
  	      // Just continue formatting and the behavior should be logical.
  	      // Also ignore unknown tokens.  Again, this should result in better behavior.
  	      this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
  	      this.handle_token(comment_token, preserve_statement_flags);
  	      comment_token = current_token.comments_before.next();
  	    }
  	  }

  	  if (keep_whitespace) {
  	    for (var i = 0; i < newlines; i += 1) {
  	      this.print_newline(i > 0, preserve_statement_flags);
  	    }
  	  } else {
  	    if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
  	      newlines = this._options.max_preserve_newlines;
  	    }

  	    if (this._options.preserve_newlines) {
  	      if (newlines > 1) {
  	        this.print_newline(false, preserve_statement_flags);
  	        for (var j = 1; j < newlines; j += 1) {
  	          this.print_newline(true, preserve_statement_flags);
  	        }
  	      }
  	    }
  	  }

  	};

  	var newline_restricted_tokens = ['async', 'break', 'continue', 'return', 'throw', 'yield'];

  	Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
  	  force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

  	  // Never wrap the first token on a line
  	  if (this._output.just_added_newline()) {
  	    return;
  	  }

  	  var shouldPreserveOrForce = (this._options.preserve_newlines && current_token.newlines) || force_linewrap;
  	  var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) ||
  	    in_array(current_token.text, positionable_operators);

  	  if (operatorLogicApplies) {
  	    var shouldPrintOperatorNewline = (
  	        in_array(this._flags.last_token.text, positionable_operators) &&
  	        in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)
  	      ) ||
  	      in_array(current_token.text, positionable_operators);
  	    shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
  	  }

  	  if (shouldPreserveOrForce) {
  	    this.print_newline(false, true);
  	  } else if (this._options.wrap_line_length) {
  	    if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
  	      // These tokens should never have a newline inserted
  	      // between them and the following expression.
  	      return;
  	    }
  	    this._output.set_wrap_point();
  	  }
  	};

  	Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
  	  if (!preserve_statement_flags) {
  	    if (this._flags.last_token.text !== ';' && this._flags.last_token.text !== ',' && this._flags.last_token.text !== '=' && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) {
  	      var next_token = this._tokens.peek();
  	      while (this._flags.mode === MODE.Statement &&
  	        !(this._flags.if_block && reserved_word(next_token, 'else')) &&
  	        !this._flags.do_block) {
  	        this.restore_mode();
  	      }
  	    }
  	  }

  	  if (this._output.add_new_line(force_newline)) {
  	    this._flags.multiline_frame = true;
  	  }
  	};

  	Beautifier.prototype.print_token_line_indentation = function(current_token) {
  	  if (this._output.just_added_newline()) {
  	    if (this._options.keep_array_indentation &&
  	      current_token.newlines &&
  	      (current_token.text === '[' || is_array(this._flags.mode))) {
  	      this._output.current_line.set_indent(-1);
  	      this._output.current_line.push(current_token.whitespace_before);
  	      this._output.space_before_token = false;
  	    } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
  	      this._flags.line_indent_level = this._flags.indentation_level;
  	    }
  	  }
  	};

  	Beautifier.prototype.print_token = function(current_token) {
  	  if (this._output.raw) {
  	    this._output.add_raw_token(current_token);
  	    return;
  	  }

  	  if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA &&
  	    this._output.just_added_newline()) {
  	    if (this._output.previous_line.last() === ',') {
  	      var popped = this._output.previous_line.pop();
  	      // if the comma was already at the start of the line,
  	      // pull back onto that line and reprint the indentation
  	      if (this._output.previous_line.is_empty()) {
  	        this._output.previous_line.push(popped);
  	        this._output.trim(true);
  	        this._output.current_line.pop();
  	        this._output.trim();
  	      }

  	      // add the comma in front of the next token
  	      this.print_token_line_indentation(current_token);
  	      this._output.add_token(',');
  	      this._output.space_before_token = true;
  	    }
  	  }

  	  this.print_token_line_indentation(current_token);
  	  this._output.non_breaking_space = true;
  	  this._output.add_token(current_token.text);
  	  if (this._output.previous_token_wrapped) {
  	    this._flags.multiline_frame = true;
  	  }
  	};

  	Beautifier.prototype.indent = function() {
  	  this._flags.indentation_level += 1;
  	  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  	};

  	Beautifier.prototype.deindent = function() {
  	  if (this._flags.indentation_level > 0 &&
  	    ((!this._flags.parent) || this._flags.indentation_level > this._flags.parent.indentation_level)) {
  	    this._flags.indentation_level -= 1;
  	    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  	  }
  	};

  	Beautifier.prototype.set_mode = function(mode) {
  	  if (this._flags) {
  	    this._flag_store.push(this._flags);
  	    this._previous_flags = this._flags;
  	  } else {
  	    this._previous_flags = this.create_flags(null, mode);
  	  }

  	  this._flags = this.create_flags(this._previous_flags, mode);
  	  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  	};


  	Beautifier.prototype.restore_mode = function() {
  	  if (this._flag_store.length > 0) {
  	    this._previous_flags = this._flags;
  	    this._flags = this._flag_store.pop();
  	    if (this._previous_flags.mode === MODE.Statement) {
  	      remove_redundant_indentation(this._output, this._previous_flags);
  	    }
  	    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  	  }
  	};

  	Beautifier.prototype.start_of_object_property = function() {
  	  return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (
  	    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || (reserved_array(this._flags.last_token, ['get', 'set'])));
  	};

  	Beautifier.prototype.start_of_statement = function(current_token) {
  	  var start = false;
  	  start = start || reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD;
  	  start = start || reserved_word(this._flags.last_token, 'do');
  	  start = start || (!(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement)) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
  	  start = start || reserved_word(this._flags.last_token, 'else') &&
  	    !(reserved_word(current_token, 'if') && !current_token.comments_before);
  	  start = start || (this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional));
  	  start = start || (this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement &&
  	    !this._flags.in_case &&
  	    !(current_token.text === '--' || current_token.text === '++') &&
  	    this._last_last_text !== 'function' &&
  	    current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED);
  	  start = start || (this._flags.mode === MODE.ObjectLiteral && (
  	    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || reserved_array(this._flags.last_token, ['get', 'set'])));

  	  if (start) {
  	    this.set_mode(MODE.Statement);
  	    this.indent();

  	    this.handle_whitespace_and_comments(current_token, true);

  	    // Issue #276:
  	    // If starting a new statement with [if, for, while, do], push to a new line.
  	    // if (a) if (b) if(c) d(); else e(); else f();
  	    if (!this.start_of_object_property()) {
  	      this.allow_wrap_or_preserved_newline(current_token,
  	        reserved_array(current_token, ['do', 'for', 'if', 'while']));
  	    }
  	    return true;
  	  }
  	  return false;
  	};

  	Beautifier.prototype.handle_start_expr = function(current_token) {
  	  // The conditional starts the statement if appropriate.
  	  if (!this.start_of_statement(current_token)) {
  	    this.handle_whitespace_and_comments(current_token);
  	  }

  	  var next_mode = MODE.Expression;
  	  if (current_token.text === '[') {

  	    if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ')') {
  	      // this is array index specifier, break immediately
  	      // a[x], fn()[x]
  	      if (reserved_array(this._flags.last_token, line_starters)) {
  	        this._output.space_before_token = true;
  	      }
  	      this.print_token(current_token);
  	      this.set_mode(next_mode);
  	      this.indent();
  	      if (this._options.space_in_paren) {
  	        this._output.space_before_token = true;
  	      }
  	      return;
  	    }

  	    next_mode = MODE.ArrayLiteral;
  	    if (is_array(this._flags.mode)) {
  	      if (this._flags.last_token.text === '[' ||
  	        (this._flags.last_token.text === ',' && (this._last_last_text === ']' || this._last_last_text === '}'))) {
  	        // ], [ goes to new line
  	        // }, [ goes to new line
  	        if (!this._options.keep_array_indentation) {
  	          this.print_newline();
  	        }
  	      }
  	    }

  	    if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR, TOKEN.DOT])) {
  	      this._output.space_before_token = true;
  	    }
  	  } else {
  	    if (this._flags.last_token.type === TOKEN.RESERVED) {
  	      if (this._flags.last_token.text === 'for') {
  	        this._output.space_before_token = this._options.space_before_conditional;
  	        next_mode = MODE.ForInitializer;
  	      } else if (in_array(this._flags.last_token.text, ['if', 'while', 'switch'])) {
  	        this._output.space_before_token = this._options.space_before_conditional;
  	        next_mode = MODE.Conditional;
  	      } else if (in_array(this._flags.last_word, ['await', 'async'])) {
  	        // Should be a space between await and an IIFE, or async and an arrow function
  	        this._output.space_before_token = true;
  	      } else if (this._flags.last_token.text === 'import' && current_token.whitespace_before === '') {
  	        this._output.space_before_token = false;
  	      } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === 'catch') {
  	        this._output.space_before_token = true;
  	      }
  	    } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
  	      // Support of this kind of newline preservation.
  	      // a = (b &&
  	      //     (c || d));
  	      if (!this.start_of_object_property()) {
  	        this.allow_wrap_or_preserved_newline(current_token);
  	      }
  	    } else if (this._flags.last_token.type === TOKEN.WORD) {
  	      this._output.space_before_token = false;

  	      // function name() vs function name ()
  	      // function* name() vs function* name ()
  	      // async name() vs async name ()
  	      // In ES6, you can also define the method properties of an object
  	      // var obj = {a: function() {}}
  	      // It can be abbreviated
  	      // var obj = {a() {}}
  	      // var obj = { a() {}} vs var obj = { a () {}}
  	      // var obj = { * a() {}} vs var obj = { * a () {}}
  	      var peek_back_two = this._tokens.peek(-3);
  	      if (this._options.space_after_named_function && peek_back_two) {
  	        // peek starts at next character so -1 is current token
  	        var peek_back_three = this._tokens.peek(-4);
  	        if (reserved_array(peek_back_two, ['async', 'function']) ||
  	          (peek_back_two.text === '*' && reserved_array(peek_back_three, ['async', 'function']))) {
  	          this._output.space_before_token = true;
  	        } else if (this._flags.mode === MODE.ObjectLiteral) {
  	          if ((peek_back_two.text === '{' || peek_back_two.text === ',') ||
  	            (peek_back_two.text === '*' && (peek_back_three.text === '{' || peek_back_three.text === ','))) {
  	            this._output.space_before_token = true;
  	          }
  	        } else if (this._flags.parent && this._flags.parent.class_start_block) {
  	          this._output.space_before_token = true;
  	        }
  	      }
  	    } else {
  	      // Support preserving wrapped arrow function expressions
  	      // a.b('c',
  	      //     () => d.e
  	      // )
  	      this.allow_wrap_or_preserved_newline(current_token);
  	    }

  	    // function() vs function ()
  	    // yield*() vs yield* ()
  	    // function*() vs function* ()
  	    if ((this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === 'function' || this._flags.last_word === 'typeof')) ||
  	      (this._flags.last_token.text === '*' &&
  	        (in_array(this._last_last_text, ['function', 'yield']) ||
  	          (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
  	      this._output.space_before_token = this._options.space_after_anon_function;
  	    }
  	  }

  	  if (this._flags.last_token.text === ';' || this._flags.last_token.type === TOKEN.START_BLOCK) {
  	    this.print_newline();
  	  } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === '.' || this._flags.last_token.type === TOKEN.COMMA) {
  	    // do nothing on (( and )( and ][ and ]( and .(
  	    // TODO: Consider whether forcing this is required.  Review failing tests when removed.
  	    this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
  	  }

  	  this.print_token(current_token);
  	  this.set_mode(next_mode);
  	  if (this._options.space_in_paren) {
  	    this._output.space_before_token = true;
  	  }

  	  // In all cases, if we newline while inside an expression it should be indented.
  	  this.indent();
  	};

  	Beautifier.prototype.handle_end_expr = function(current_token) {
  	  // statements inside expressions are not valid syntax, but...
  	  // statements must all be closed when their container closes
  	  while (this._flags.mode === MODE.Statement) {
  	    this.restore_mode();
  	  }

  	  this.handle_whitespace_and_comments(current_token);

  	  if (this._flags.multiline_frame) {
  	    this.allow_wrap_or_preserved_newline(current_token,
  	      current_token.text === ']' && is_array(this._flags.mode) && !this._options.keep_array_indentation);
  	  }

  	  if (this._options.space_in_paren) {
  	    if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
  	      // () [] no inner space in empty parens like these, ever, ref #320
  	      this._output.trim();
  	      this._output.space_before_token = false;
  	    } else {
  	      this._output.space_before_token = true;
  	    }
  	  }
  	  this.deindent();
  	  this.print_token(current_token);
  	  this.restore_mode();

  	  remove_redundant_indentation(this._output, this._previous_flags);

  	  // do {} while () // no statement required after
  	  if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
  	    this._previous_flags.mode = MODE.Expression;
  	    this._flags.do_block = false;
  	    this._flags.do_while = false;

  	  }
  	};

  	Beautifier.prototype.handle_start_block = function(current_token) {
  	  this.handle_whitespace_and_comments(current_token);

  	  // Check if this is should be treated as a ObjectLiteral
  	  var next_token = this._tokens.peek();
  	  var second_token = this._tokens.peek(1);
  	  if (this._flags.last_word === 'switch' && this._flags.last_token.type === TOKEN.END_EXPR) {
  	    this.set_mode(MODE.BlockStatement);
  	    this._flags.in_case_statement = true;
  	  } else if (this._flags.case_body) {
  	    this.set_mode(MODE.BlockStatement);
  	  } else if (second_token && (
  	      (in_array(second_token.text, [':', ',']) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED])) ||
  	      (in_array(next_token.text, ['get', 'set', '...']) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))
  	    )) {
  	    // We don't support TypeScript,but we didn't break it for a very long time.
  	    // We'll try to keep not breaking it.
  	    if (in_array(this._last_last_text, ['class', 'interface']) && !in_array(second_token.text, [':', ','])) {
  	      this.set_mode(MODE.BlockStatement);
  	    } else {
  	      this.set_mode(MODE.ObjectLiteral);
  	    }
  	  } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === '=>') {
  	    // arrow function: (param1, paramN) => { statements }
  	    this.set_mode(MODE.BlockStatement);
  	  } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) ||
  	    reserved_array(this._flags.last_token, ['return', 'throw', 'import', 'default'])
  	  ) {
  	    // Detecting shorthand function syntax is difficult by scanning forward,
  	    //     so check the surrounding context.
  	    // If the block is being returned, imported, export default, passed as arg,
  	    //     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
  	    this.set_mode(MODE.ObjectLiteral);
  	  } else {
  	    this.set_mode(MODE.BlockStatement);
  	  }

  	  if (this._flags.last_token) {
  	    if (reserved_array(this._flags.last_token.previous, ['class', 'extends'])) {
  	      this._flags.class_start_block = true;
  	    }
  	  }

  	  var empty_braces = !next_token.comments_before && next_token.text === '}';
  	  var empty_anonymous_function = empty_braces && this._flags.last_word === 'function' &&
  	    this._flags.last_token.type === TOKEN.END_EXPR;

  	  if (this._options.brace_preserve_inline) // check for inline, set inline_frame if so
  	  {
  	    // search forward for a newline wanted inside this block
  	    var index = 0;
  	    var check_token = null;
  	    this._flags.inline_frame = true;
  	    do {
  	      index += 1;
  	      check_token = this._tokens.peek(index - 1);
  	      if (check_token.newlines) {
  	        this._flags.inline_frame = false;
  	        break;
  	      }
  	    } while (check_token.type !== TOKEN.EOF &&
  	      !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
  	  }

  	  if ((this._options.brace_style === "expand" ||
  	      (this._options.brace_style === "none" && current_token.newlines)) &&
  	    !this._flags.inline_frame) {
  	    if (this._flags.last_token.type !== TOKEN.OPERATOR &&
  	      (empty_anonymous_function ||
  	        this._flags.last_token.type === TOKEN.EQUALS ||
  	        (reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== 'else'))) {
  	      this._output.space_before_token = true;
  	    } else {
  	      this.print_newline(false, true);
  	    }
  	  } else { // collapse || inline_frame
  	    if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
  	      if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
  	        this._output.space_before_token = true;
  	      }

  	      if (this._flags.last_token.type === TOKEN.COMMA || (this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame)) {
  	        this.allow_wrap_or_preserved_newline(current_token);
  	        this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
  	        this._flags.multiline_frame = false;
  	      }
  	    }
  	    if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
  	      if (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.SEMICOLON]) && !this._flags.inline_frame) {
  	        this.print_newline();
  	      } else {
  	        this._output.space_before_token = true;
  	      }
  	    }
  	  }
  	  this.print_token(current_token);
  	  this.indent();

  	  // Except for specific cases, open braces are followed by a new line.
  	  if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
  	    this.print_newline();
  	  }
  	};

  	Beautifier.prototype.handle_end_block = function(current_token) {
  	  // statements must all be closed when their container closes
  	  this.handle_whitespace_and_comments(current_token);

  	  while (this._flags.mode === MODE.Statement) {
  	    this.restore_mode();
  	  }

  	  var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;

  	  if (this._flags.inline_frame && !empty_braces) { // try inline_frame (only set if this._options.braces-preserve-inline) first
  	    this._output.space_before_token = true;
  	  } else if (this._options.brace_style === "expand") {
  	    if (!empty_braces) {
  	      this.print_newline();
  	    }
  	  } else {
  	    // skip {}
  	    if (!empty_braces) {
  	      if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
  	        // we REALLY need a newline here, but newliner would skip that
  	        this._options.keep_array_indentation = false;
  	        this.print_newline();
  	        this._options.keep_array_indentation = true;

  	      } else {
  	        this.print_newline();
  	      }
  	    }
  	  }
  	  this.restore_mode();
  	  this.print_token(current_token);
  	};

  	Beautifier.prototype.handle_word = function(current_token) {
  	  if (current_token.type === TOKEN.RESERVED) {
  	    if (in_array(current_token.text, ['set', 'get']) && this._flags.mode !== MODE.ObjectLiteral) {
  	      current_token.type = TOKEN.WORD;
  	    } else if (current_token.text === 'import' && in_array(this._tokens.peek().text, ['(', '.'])) {
  	      current_token.type = TOKEN.WORD;
  	    } else if (in_array(current_token.text, ['as', 'from']) && !this._flags.import_block) {
  	      current_token.type = TOKEN.WORD;
  	    } else if (this._flags.mode === MODE.ObjectLiteral) {
  	      var next_token = this._tokens.peek();
  	      if (next_token.text === ':') {
  	        current_token.type = TOKEN.WORD;
  	      }
  	    }
  	  }

  	  if (this.start_of_statement(current_token)) {
  	    // The conditional starts the statement if appropriate.
  	    if (reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD) {
  	      this._flags.declaration_statement = true;
  	    }
  	  } else if (current_token.newlines && !is_expression(this._flags.mode) &&
  	    (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) &&
  	    this._flags.last_token.type !== TOKEN.EQUALS &&
  	    (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ['var', 'let', 'const', 'set', 'get']))) {
  	    this.handle_whitespace_and_comments(current_token);
  	    this.print_newline();
  	  } else {
  	    this.handle_whitespace_and_comments(current_token);
  	  }

  	  if (this._flags.do_block && !this._flags.do_while) {
  	    if (reserved_word(current_token, 'while')) {
  	      // do {} ## while ()
  	      this._output.space_before_token = true;
  	      this.print_token(current_token);
  	      this._output.space_before_token = true;
  	      this._flags.do_while = true;
  	      return;
  	    } else {
  	      // do {} should always have while as the next word.
  	      // if we don't see the expected while, recover
  	      this.print_newline();
  	      this._flags.do_block = false;
  	    }
  	  }

  	  // if may be followed by else, or not
  	  // Bare/inline ifs are tricky
  	  // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
  	  if (this._flags.if_block) {
  	    if (!this._flags.else_block && reserved_word(current_token, 'else')) {
  	      this._flags.else_block = true;
  	    } else {
  	      while (this._flags.mode === MODE.Statement) {
  	        this.restore_mode();
  	      }
  	      this._flags.if_block = false;
  	      this._flags.else_block = false;
  	    }
  	  }

  	  if (this._flags.in_case_statement && reserved_array(current_token, ['case', 'default'])) {
  	    this.print_newline();
  	    if (!this._flags.case_block && (this._flags.case_body || this._options.jslint_happy)) {
  	      // switch cases following one another
  	      this.deindent();
  	    }
  	    this._flags.case_body = false;

  	    this.print_token(current_token);
  	    this._flags.in_case = true;
  	    return;
  	  }

  	  if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
  	    if (!this.start_of_object_property()) {
  	      this.allow_wrap_or_preserved_newline(current_token);
  	    }
  	  }

  	  if (reserved_word(current_token, 'function')) {
  	    if (in_array(this._flags.last_token.text, ['}', ';']) ||
  	      (this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ['(', '[', '{', ':', '=', ',']) || this._flags.last_token.type === TOKEN.OPERATOR))) {
  	      // make sure there is a nice clean space of at least one blank line
  	      // before a new function definition
  	      if (!this._output.just_added_blankline() && !current_token.comments_before) {
  	        this.print_newline();
  	        this.print_newline(true);
  	      }
  	    }
  	    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
  	      if (reserved_array(this._flags.last_token, ['get', 'set', 'new', 'export']) ||
  	        reserved_array(this._flags.last_token, newline_restricted_tokens)) {
  	        this._output.space_before_token = true;
  	      } else if (reserved_word(this._flags.last_token, 'default') && this._last_last_text === 'export') {
  	        this._output.space_before_token = true;
  	      } else if (this._flags.last_token.text === 'declare') {
  	        // accomodates Typescript declare function formatting
  	        this._output.space_before_token = true;
  	      } else {
  	        this.print_newline();
  	      }
  	    } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === '=') {
  	      // foo = function
  	      this._output.space_before_token = true;
  	    } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) ; else {
  	      this.print_newline();
  	    }

  	    this.print_token(current_token);
  	    this._flags.last_word = current_token.text;
  	    return;
  	  }

  	  var prefix = 'NONE';

  	  if (this._flags.last_token.type === TOKEN.END_BLOCK) {

  	    if (this._previous_flags.inline_frame) {
  	      prefix = 'SPACE';
  	    } else if (!reserved_array(current_token, ['else', 'catch', 'finally', 'from'])) {
  	      prefix = 'NEWLINE';
  	    } else {
  	      if (this._options.brace_style === "expand" ||
  	        this._options.brace_style === "end-expand" ||
  	        (this._options.brace_style === "none" && current_token.newlines)) {
  	        prefix = 'NEWLINE';
  	      } else {
  	        prefix = 'SPACE';
  	        this._output.space_before_token = true;
  	      }
  	    }
  	  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
  	    // TODO: Should this be for STATEMENT as well?
  	    prefix = 'NEWLINE';
  	  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
  	    prefix = 'SPACE';
  	  } else if (this._flags.last_token.type === TOKEN.STRING) {
  	    prefix = 'NEWLINE';
  	  } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD ||
  	    (this._flags.last_token.text === '*' &&
  	      (in_array(this._last_last_text, ['function', 'yield']) ||
  	        (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
  	    prefix = 'SPACE';
  	  } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
  	    if (this._flags.inline_frame) {
  	      prefix = 'SPACE';
  	    } else {
  	      prefix = 'NEWLINE';
  	    }
  	  } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
  	    this._output.space_before_token = true;
  	    prefix = 'NEWLINE';
  	  }

  	  if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
  	    if (this._flags.inline_frame || this._flags.last_token.text === 'else' || this._flags.last_token.text === 'export') {
  	      prefix = 'SPACE';
  	    } else {
  	      prefix = 'NEWLINE';
  	    }

  	  }

  	  if (reserved_array(current_token, ['else', 'catch', 'finally'])) {
  	    if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) ||
  	        this._options.brace_style === "expand" ||
  	        this._options.brace_style === "end-expand" ||
  	        (this._options.brace_style === "none" && current_token.newlines)) &&
  	      !this._flags.inline_frame) {
  	      this.print_newline();
  	    } else {
  	      this._output.trim(true);
  	      var line = this._output.current_line;
  	      // If we trimmed and there's something other than a close block before us
  	      // put a newline back in.  Handles '} // comment' scenario.
  	      if (line.last() !== '}') {
  	        this.print_newline();
  	      }
  	      this._output.space_before_token = true;
  	    }
  	  } else if (prefix === 'NEWLINE') {
  	    if (reserved_array(this._flags.last_token, special_words)) {
  	      // no newline between 'return nnn'
  	      this._output.space_before_token = true;
  	    } else if (this._flags.last_token.text === 'declare' && reserved_array(current_token, ['var', 'let', 'const'])) {
  	      // accomodates Typescript declare formatting
  	      this._output.space_before_token = true;
  	    } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
  	      if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ['var', 'let', 'const'])) && this._flags.last_token.text !== ':') {
  	        // no need to force newline on 'var': for (var x = 0...)
  	        if (reserved_word(current_token, 'if') && reserved_word(current_token.previous, 'else')) {
  	          // no newline for } else if {
  	          this._output.space_before_token = true;
  	        } else {
  	          this.print_newline();
  	        }
  	      }
  	    } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
  	      this.print_newline();
  	    }
  	  } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === ',' && this._last_last_text === '}') {
  	    this.print_newline(); // }, in lists get a newline treatment
  	  } else if (prefix === 'SPACE') {
  	    this._output.space_before_token = true;
  	  }
  	  if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
  	    this._output.space_before_token = true;
  	  }
  	  this.print_token(current_token);
  	  this._flags.last_word = current_token.text;

  	  if (current_token.type === TOKEN.RESERVED) {
  	    if (current_token.text === 'do') {
  	      this._flags.do_block = true;
  	    } else if (current_token.text === 'if') {
  	      this._flags.if_block = true;
  	    } else if (current_token.text === 'import') {
  	      this._flags.import_block = true;
  	    } else if (this._flags.import_block && reserved_word(current_token, 'from')) {
  	      this._flags.import_block = false;
  	    }
  	  }
  	};

  	Beautifier.prototype.handle_semicolon = function(current_token) {
  	  if (this.start_of_statement(current_token)) {
  	    // The conditional starts the statement if appropriate.
  	    // Semicolon can be the start (and end) of a statement
  	    this._output.space_before_token = false;
  	  } else {
  	    this.handle_whitespace_and_comments(current_token);
  	  }

  	  var next_token = this._tokens.peek();
  	  while (this._flags.mode === MODE.Statement &&
  	    !(this._flags.if_block && reserved_word(next_token, 'else')) &&
  	    !this._flags.do_block) {
  	    this.restore_mode();
  	  }

  	  // hacky but effective for the moment
  	  if (this._flags.import_block) {
  	    this._flags.import_block = false;
  	  }
  	  this.print_token(current_token);
  	};

  	Beautifier.prototype.handle_string = function(current_token) {
  	  if (current_token.text.startsWith("`") && current_token.newlines === 0 && current_token.whitespace_before === '' && (current_token.previous.text === ')' || this._flags.last_token.type === TOKEN.WORD)) ; else if (this.start_of_statement(current_token)) {
  	    // The conditional starts the statement if appropriate.
  	    // One difference - strings want at least a space before
  	    this._output.space_before_token = true;
  	  } else {
  	    this.handle_whitespace_and_comments(current_token);
  	    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
  	      this._output.space_before_token = true;
  	    } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
  	      if (!this.start_of_object_property()) {
  	        this.allow_wrap_or_preserved_newline(current_token);
  	      }
  	    } else if ((current_token.text.startsWith("`") && this._flags.last_token.type === TOKEN.END_EXPR && (current_token.previous.text === ']' || current_token.previous.text === ')') && current_token.newlines === 0)) {
  	      this._output.space_before_token = true;
  	    } else {
  	      this.print_newline();
  	    }
  	  }
  	  this.print_token(current_token);
  	};

  	Beautifier.prototype.handle_equals = function(current_token) {
  	  if (this.start_of_statement(current_token)) ; else {
  	    this.handle_whitespace_and_comments(current_token);
  	  }

  	  if (this._flags.declaration_statement) {
  	    // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
  	    this._flags.declaration_assignment = true;
  	  }
  	  this._output.space_before_token = true;
  	  this.print_token(current_token);
  	  this._output.space_before_token = true;
  	};

  	Beautifier.prototype.handle_comma = function(current_token) {
  	  this.handle_whitespace_and_comments(current_token, true);

  	  this.print_token(current_token);
  	  this._output.space_before_token = true;
  	  if (this._flags.declaration_statement) {
  	    if (is_expression(this._flags.parent.mode)) {
  	      // do not break on comma, for(var a = 1, b = 2)
  	      this._flags.declaration_assignment = false;
  	    }

  	    if (this._flags.declaration_assignment) {
  	      this._flags.declaration_assignment = false;
  	      this.print_newline(false, true);
  	    } else if (this._options.comma_first) {
  	      // for comma-first, we want to allow a newline before the comma
  	      // to turn into a newline after the comma, which we will fixup later
  	      this.allow_wrap_or_preserved_newline(current_token);
  	    }
  	  } else if (this._flags.mode === MODE.ObjectLiteral ||
  	    (this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral)) {
  	    if (this._flags.mode === MODE.Statement) {
  	      this.restore_mode();
  	    }

  	    if (!this._flags.inline_frame) {
  	      this.print_newline();
  	    }
  	  } else if (this._options.comma_first) {
  	    // EXPR or DO_BLOCK
  	    // for comma-first, we want to allow a newline before the comma
  	    // to turn into a newline after the comma, which we will fixup later
  	    this.allow_wrap_or_preserved_newline(current_token);
  	  }
  	};

  	Beautifier.prototype.handle_operator = function(current_token) {
  	  var isGeneratorAsterisk = current_token.text === '*' &&
  	    (reserved_array(this._flags.last_token, ['function', 'yield']) ||
  	      (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]))
  	    );
  	  var isUnary = in_array(current_token.text, ['-', '+']) && (
  	    in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) ||
  	    in_array(this._flags.last_token.text, line_starters) ||
  	    this._flags.last_token.text === ','
  	  );

  	  if (this.start_of_statement(current_token)) ; else {
  	    var preserve_statement_flags = !isGeneratorAsterisk;
  	    this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
  	  }

  	  // hack for actionscript's import .*;
  	  if (current_token.text === '*' && this._flags.last_token.type === TOKEN.DOT) {
  	    this.print_token(current_token);
  	    return;
  	  }

  	  if (current_token.text === '::') {
  	    // no spaces around exotic namespacing syntax operator
  	    this.print_token(current_token);
  	    return;
  	  }

  	  // Allow line wrapping between operators when operator_position is
  	  //   set to before or preserve
  	  if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
  	    this.allow_wrap_or_preserved_newline(current_token);
  	  }

  	  if (current_token.text === ':' && this._flags.in_case) {
  	    this.print_token(current_token);

  	    this._flags.in_case = false;
  	    this._flags.case_body = true;
  	    if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
  	      this.indent();
  	      this.print_newline();
  	      this._flags.case_block = false;
  	    } else {
  	      this._flags.case_block = true;
  	      this._output.space_before_token = true;
  	    }
  	    return;
  	  }

  	  var space_before = true;
  	  var space_after = true;
  	  var in_ternary = false;
  	  if (current_token.text === ':') {
  	    if (this._flags.ternary_depth === 0) {
  	      // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
  	      space_before = false;
  	    } else {
  	      this._flags.ternary_depth -= 1;
  	      in_ternary = true;
  	    }
  	  } else if (current_token.text === '?') {
  	    this._flags.ternary_depth += 1;
  	  }

  	  // let's handle the operator_position option prior to any conflicting logic
  	  if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
  	    var isColon = current_token.text === ':';
  	    var isTernaryColon = (isColon && in_ternary);
  	    var isOtherColon = (isColon && !in_ternary);

  	    switch (this._options.operator_position) {
  	      case OPERATOR_POSITION.before_newline:
  	        // if the current token is : and it's not a ternary statement then we set space_before to false
  	        this._output.space_before_token = !isOtherColon;

  	        this.print_token(current_token);

  	        if (!isColon || isTernaryColon) {
  	          this.allow_wrap_or_preserved_newline(current_token);
  	        }

  	        this._output.space_before_token = true;
  	        return;

  	      case OPERATOR_POSITION.after_newline:
  	        // if the current token is anything but colon, or (via deduction) it's a colon and in a ternary statement,
  	        //   then print a newline.

  	        this._output.space_before_token = true;

  	        if (!isColon || isTernaryColon) {
  	          if (this._tokens.peek().newlines) {
  	            this.print_newline(false, true);
  	          } else {
  	            this.allow_wrap_or_preserved_newline(current_token);
  	          }
  	        } else {
  	          this._output.space_before_token = false;
  	        }

  	        this.print_token(current_token);

  	        this._output.space_before_token = true;
  	        return;

  	      case OPERATOR_POSITION.preserve_newline:
  	        if (!isOtherColon) {
  	          this.allow_wrap_or_preserved_newline(current_token);
  	        }

  	        // if we just added a newline, or the current token is : and it's not a ternary statement,
  	        //   then we set space_before to false
  	        space_before = !(this._output.just_added_newline() || isOtherColon);

  	        this._output.space_before_token = space_before;
  	        this.print_token(current_token);
  	        this._output.space_before_token = true;
  	        return;
  	    }
  	  }

  	  if (isGeneratorAsterisk) {
  	    this.allow_wrap_or_preserved_newline(current_token);
  	    space_before = false;
  	    var next_token = this._tokens.peek();
  	    space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
  	  } else if (current_token.text === '...') {
  	    this.allow_wrap_or_preserved_newline(current_token);
  	    space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
  	    space_after = false;
  	  } else if (in_array(current_token.text, ['--', '++', '!', '~']) || isUnary) {
  	    // unary operators (and binary +/- pretending to be unary) special cases
  	    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
  	      this.allow_wrap_or_preserved_newline(current_token);
  	    }

  	    space_before = false;
  	    space_after = false;

  	    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
  	    // if there is a newline between -- or ++ and anything else we should preserve it.
  	    if (current_token.newlines && (current_token.text === '--' || current_token.text === '++' || current_token.text === '~')) {
  	      var new_line_needed = reserved_array(this._flags.last_token, special_words) && current_token.newlines;
  	      if (new_line_needed && (this._previous_flags.if_block || this._previous_flags.else_block)) {
  	        this.restore_mode();
  	      }
  	      this.print_newline(new_line_needed, true);
  	    }

  	    if (this._flags.last_token.text === ';' && is_expression(this._flags.mode)) {
  	      // for (;; ++i)
  	      //        ^^^
  	      space_before = true;
  	    }

  	    if (this._flags.last_token.type === TOKEN.RESERVED) {
  	      space_before = true;
  	    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
  	      space_before = !(this._flags.last_token.text === ']' && (current_token.text === '--' || current_token.text === '++'));
  	    } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
  	      // a++ + ++b;
  	      // a - -b
  	      space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(this._flags.last_token.text, ['--', '-', '++', '+']);
  	      // + and - are not unary when preceeded by -- or ++ operator
  	      // a-- + b
  	      // a * +b
  	      // a - -b
  	      if (in_array(current_token.text, ['+', '-']) && in_array(this._flags.last_token.text, ['--', '++'])) {
  	        space_after = true;
  	      }
  	    }


  	    if (((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame) || this._flags.mode === MODE.Statement) &&
  	      (this._flags.last_token.text === '{' || this._flags.last_token.text === ';')) {
  	      // { foo; --i }
  	      // foo(); --bar;
  	      this.print_newline();
  	    }
  	  }

  	  this._output.space_before_token = this._output.space_before_token || space_before;
  	  this.print_token(current_token);
  	  this._output.space_before_token = space_after;
  	};

  	Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
  	  if (this._output.raw) {
  	    this._output.add_raw_token(current_token);
  	    if (current_token.directives && current_token.directives.preserve === 'end') {
  	      // If we're testing the raw output behavior, do not allow a directive to turn it off.
  	      this._output.raw = this._options.test_output_raw;
  	    }
  	    return;
  	  }

  	  if (current_token.directives) {
  	    this.print_newline(false, preserve_statement_flags);
  	    this.print_token(current_token);
  	    if (current_token.directives.preserve === 'start') {
  	      this._output.raw = true;
  	    }
  	    this.print_newline(false, true);
  	    return;
  	  }

  	  // inline block
  	  if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
  	    this._output.space_before_token = true;
  	    this.print_token(current_token);
  	    this._output.space_before_token = true;
  	    return;
  	  } else {
  	    this.print_block_commment(current_token, preserve_statement_flags);
  	  }
  	};

  	Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
  	  var lines = split_linebreaks(current_token.text);
  	  var j; // iterator for this case
  	  var javadoc = false;
  	  var starless = false;
  	  var lastIndent = current_token.whitespace_before;
  	  var lastIndentLength = lastIndent.length;

  	  // block comment starts with a new line
  	  this.print_newline(false, preserve_statement_flags);

  	  // first line always indented
  	  this.print_token_line_indentation(current_token);
  	  this._output.add_token(lines[0]);
  	  this.print_newline(false, preserve_statement_flags);


  	  if (lines.length > 1) {
  	    lines = lines.slice(1);
  	    javadoc = all_lines_start_with(lines, '*');
  	    starless = each_line_matches_indent(lines, lastIndent);

  	    if (javadoc) {
  	      this._flags.alignment = 1;
  	    }

  	    for (j = 0; j < lines.length; j++) {
  	      if (javadoc) {
  	        // javadoc: reformat and re-indent
  	        this.print_token_line_indentation(current_token);
  	        this._output.add_token(ltrim(lines[j]));
  	      } else if (starless && lines[j]) {
  	        // starless: re-indent non-empty content, avoiding trim
  	        this.print_token_line_indentation(current_token);
  	        this._output.add_token(lines[j].substring(lastIndentLength));
  	      } else {
  	        // normal comments output raw
  	        this._output.current_line.set_indent(-1);
  	        this._output.add_token(lines[j]);
  	      }

  	      // for comments on their own line or  more than one line, make sure there's a new line after
  	      this.print_newline(false, preserve_statement_flags);
  	    }

  	    this._flags.alignment = 0;
  	  }
  	};


  	Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
  	  if (current_token.newlines) {
  	    this.print_newline(false, preserve_statement_flags);
  	  } else {
  	    this._output.trim(true);
  	  }

  	  this._output.space_before_token = true;
  	  this.print_token(current_token);
  	  this.print_newline(false, preserve_statement_flags);
  	};

  	Beautifier.prototype.handle_dot = function(current_token) {
  	  if (this.start_of_statement(current_token)) ; else {
  	    this.handle_whitespace_and_comments(current_token, true);
  	  }

  	  if (this._flags.last_token.text.match('^[0-9]+$')) {
  	    this._output.space_before_token = true;
  	  }

  	  if (reserved_array(this._flags.last_token, special_words)) {
  	    this._output.space_before_token = false;
  	  } else {
  	    // allow preserved newlines before dots in general
  	    // force newlines on dots after close paren when break_chained - for bar().baz()
  	    this.allow_wrap_or_preserved_newline(current_token,
  	      this._flags.last_token.text === ')' && this._options.break_chained_methods);
  	  }

  	  // Only unindent chained method dot if this dot starts a new line.
  	  // Otherwise the automatic extra indentation removal will handle the over indent
  	  if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
  	    this.deindent();
  	  }

  	  this.print_token(current_token);
  	};

  	Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
  	  this.print_token(current_token);

  	  if (current_token.text[current_token.text.length - 1] === '\n') {
  	    this.print_newline(false, preserve_statement_flags);
  	  }
  	};

  	Beautifier.prototype.handle_eof = function(current_token) {
  	  // Unwind any open statements
  	  while (this._flags.mode === MODE.Statement) {
  	    this.restore_mode();
  	  }
  	  this.handle_whitespace_and_comments(current_token);
  	};

  	beautifier$2.Beautifier = Beautifier;
  	return beautifier$2;
  }

  /*jshint node:true */

  var hasRequiredJavascript;

  function requireJavascript () {
  	if (hasRequiredJavascript) return javascript.exports;
  	hasRequiredJavascript = 1;

  	var Beautifier = requireBeautifier$2().Beautifier,
  	  Options = requireOptions$2().Options;

  	function js_beautify(js_source_text, options) {
  	  var beautifier = new Beautifier(js_source_text, options);
  	  return beautifier.beautify();
  	}

  	javascript.exports = js_beautify;
  	javascript.exports.defaultOptions = function() {
  	  return new Options();
  	};
  	return javascript.exports;
  }

  var css = {exports: {}};

  var beautifier$1 = {};

  var options$1 = {};

  /*jshint node:true */

  var hasRequiredOptions$1;

  function requireOptions$1 () {
  	if (hasRequiredOptions$1) return options$1;
  	hasRequiredOptions$1 = 1;

  	var BaseOptions = requireOptions$3().Options;

  	function Options(options) {
  	  BaseOptions.call(this, options, 'css');

  	  this.selector_separator_newline = this._get_boolean('selector_separator_newline', true);
  	  this.newline_between_rules = this._get_boolean('newline_between_rules', true);
  	  var space_around_selector_separator = this._get_boolean('space_around_selector_separator');
  	  this.space_around_combinator = this._get_boolean('space_around_combinator') || space_around_selector_separator;

  	  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);
  	  this.brace_style = 'collapse';
  	  for (var bs = 0; bs < brace_style_split.length; bs++) {
  	    if (brace_style_split[bs] !== 'expand') {
  	      // default to collapse, as only collapse|expand is implemented for now
  	      this.brace_style = 'collapse';
  	    } else {
  	      this.brace_style = brace_style_split[bs];
  	    }
  	  }
  	}
  	Options.prototype = new BaseOptions();



  	options$1.Options = Options;
  	return options$1;
  }

  /*jshint node:true */

  var hasRequiredBeautifier$1;

  function requireBeautifier$1 () {
  	if (hasRequiredBeautifier$1) return beautifier$1;
  	hasRequiredBeautifier$1 = 1;

  	var Options = requireOptions$1().Options;
  	var Output = requireOutput().Output;
  	var InputScanner = requireInputscanner().InputScanner;
  	var Directives = requireDirectives().Directives;

  	var directives_core = new Directives(/\/\*/, /\*\//);

  	var lineBreak = /\r\n|[\r\n]/;
  	var allLineBreaks = /\r\n|[\r\n]/g;

  	// tokenizer
  	var whitespaceChar = /\s/;
  	var whitespacePattern = /(?:\s|\n)+/g;
  	var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
  	var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;

  	function Beautifier(source_text, options) {
  	  this._source_text = source_text || '';
  	  // Allow the setting of language/file-type specific options
  	  // with inheritance of overall settings
  	  this._options = new Options(options);
  	  this._ch = null;
  	  this._input = null;

  	  // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
  	  this.NESTED_AT_RULE = {
  	    "page": true,
  	    "font-face": true,
  	    "keyframes": true,
  	    // also in CONDITIONAL_GROUP_RULE below
  	    "media": true,
  	    "supports": true,
  	    "document": true
  	  };
  	  this.CONDITIONAL_GROUP_RULE = {
  	    "media": true,
  	    "supports": true,
  	    "document": true
  	  };
  	  this.NON_SEMICOLON_NEWLINE_PROPERTY = [
  	    "grid-template-areas",
  	    "grid-template"
  	  ];

  	}

  	Beautifier.prototype.eatString = function(endChars) {
  	  var result = '';
  	  this._ch = this._input.next();
  	  while (this._ch) {
  	    result += this._ch;
  	    if (this._ch === "\\") {
  	      result += this._input.next();
  	    } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
  	      break;
  	    }
  	    this._ch = this._input.next();
  	  }
  	  return result;
  	};

  	// Skips any white space in the source text from the current position.
  	// When allowAtLeastOneNewLine is true, will output new lines for each
  	// newline character found; if the user has preserve_newlines off, only
  	// the first newline will be output
  	Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
  	  var result = whitespaceChar.test(this._input.peek());
  	  var newline_count = 0;
  	  while (whitespaceChar.test(this._input.peek())) {
  	    this._ch = this._input.next();
  	    if (allowAtLeastOneNewLine && this._ch === '\n') {
  	      if (newline_count === 0 || newline_count < this._options.max_preserve_newlines) {
  	        newline_count++;
  	        this._output.add_new_line(true);
  	      }
  	    }
  	  }
  	  return result;
  	};

  	// Nested pseudo-class if we are insideRule
  	// and the next special character found opens
  	// a new block
  	Beautifier.prototype.foundNestedPseudoClass = function() {
  	  var openParen = 0;
  	  var i = 1;
  	  var ch = this._input.peek(i);
  	  while (ch) {
  	    if (ch === "{") {
  	      return true;
  	    } else if (ch === '(') {
  	      // pseudoclasses can contain ()
  	      openParen += 1;
  	    } else if (ch === ')') {
  	      if (openParen === 0) {
  	        return false;
  	      }
  	      openParen -= 1;
  	    } else if (ch === ";" || ch === "}") {
  	      return false;
  	    }
  	    i++;
  	    ch = this._input.peek(i);
  	  }
  	  return false;
  	};

  	Beautifier.prototype.print_string = function(output_string) {
  	  this._output.set_indent(this._indentLevel);
  	  this._output.non_breaking_space = true;
  	  this._output.add_token(output_string);
  	};

  	Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
  	  if (isAfterSpace) {
  	    this._output.space_before_token = true;
  	  }
  	};

  	Beautifier.prototype.indent = function() {
  	  this._indentLevel++;
  	};

  	Beautifier.prototype.outdent = function() {
  	  if (this._indentLevel > 0) {
  	    this._indentLevel--;
  	  }
  	};

  	/*_____________________--------------------_____________________*/

  	Beautifier.prototype.beautify = function() {
  	  if (this._options.disabled) {
  	    return this._source_text;
  	  }

  	  var source_text = this._source_text;
  	  var eol = this._options.eol;
  	  if (eol === 'auto') {
  	    eol = '\n';
  	    if (source_text && lineBreak.test(source_text || '')) {
  	      eol = source_text.match(lineBreak)[0];
  	    }
  	  }


  	  // HACK: newline parsing inconsistent. This brute force normalizes the this._input.
  	  source_text = source_text.replace(allLineBreaks, '\n');

  	  // reset
  	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  	  this._output = new Output(this._options, baseIndentString);
  	  this._input = new InputScanner(source_text);
  	  this._indentLevel = 0;
  	  this._nestedLevel = 0;

  	  this._ch = null;
  	  var parenLevel = 0;

  	  var insideRule = false;
  	  // This is the value side of a property value pair (blue in the following ex)
  	  // label { content: blue }
  	  var insidePropertyValue = false;
  	  var enteringConditionalGroup = false;
  	  var insideNonNestedAtRule = false;
  	  var insideScssMap = false;
  	  var topCharacter = this._ch;
  	  var insideNonSemiColonValues = false;
  	  var whitespace;
  	  var isAfterSpace;
  	  var previous_ch;

  	  while (true) {
  	    whitespace = this._input.read(whitespacePattern);
  	    isAfterSpace = whitespace !== '';
  	    previous_ch = topCharacter;
  	    this._ch = this._input.next();
  	    if (this._ch === '\\' && this._input.hasNext()) {
  	      this._ch += this._input.next();
  	    }
  	    topCharacter = this._ch;

  	    if (!this._ch) {
  	      break;
  	    } else if (this._ch === '/' && this._input.peek() === '*') {
  	      // /* css comment */
  	      // Always start block comments on a new line.
  	      // This handles scenarios where a block comment immediately
  	      // follows a property definition on the same line or where
  	      // minified code is being beautified.
  	      this._output.add_new_line();
  	      this._input.back();

  	      var comment = this._input.read(block_comment_pattern);

  	      // Handle ignore directive
  	      var directives = directives_core.get_directives(comment);
  	      if (directives && directives.ignore === 'start') {
  	        comment += directives_core.readIgnored(this._input);
  	      }

  	      this.print_string(comment);

  	      // Ensures any new lines following the comment are preserved
  	      this.eatWhitespace(true);

  	      // Block comments are followed by a new line so they don't
  	      // share a line with other properties
  	      this._output.add_new_line();
  	    } else if (this._ch === '/' && this._input.peek() === '/') {
  	      // // single line comment
  	      // Preserves the space before a comment
  	      // on the same line as a rule
  	      this._output.space_before_token = true;
  	      this._input.back();
  	      this.print_string(this._input.read(comment_pattern));

  	      // Ensures any new lines following the comment are preserved
  	      this.eatWhitespace(true);
  	    } else if (this._ch === '$') {
  	      this.preserveSingleSpace(isAfterSpace);

  	      this.print_string(this._ch);

  	      // strip trailing space, if present, for hash property checks
  	      var variable = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

  	      if (variable.match(/[ :]$/)) {
  	        // we have a variable or pseudo-class, add it and insert one space before continuing
  	        variable = this.eatString(": ").replace(/\s$/, '');
  	        this.print_string(variable);
  	        this._output.space_before_token = true;
  	      }

  	      variable = variable.replace(/\s$/, '');

  	      // might be sass variable
  	      if (parenLevel === 0 && variable.indexOf(':') !== -1) {
  	        insidePropertyValue = true;
  	        this.indent();
  	      }
  	    } else if (this._ch === '@') {
  	      this.preserveSingleSpace(isAfterSpace);

  	      // deal with less property mixins @{...}
  	      if (this._input.peek() === '{') {
  	        this.print_string(this._ch + this.eatString('}'));
  	      } else {
  	        this.print_string(this._ch);

  	        // strip trailing space, if present, for hash property checks
  	        var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

  	        if (variableOrRule.match(/[ :]$/)) {
  	          // we have a variable or pseudo-class, add it and insert one space before continuing
  	          variableOrRule = this.eatString(": ").replace(/\s$/, '');
  	          this.print_string(variableOrRule);
  	          this._output.space_before_token = true;
  	        }

  	        variableOrRule = variableOrRule.replace(/\s$/, '');

  	        // might be less variable
  	        if (parenLevel === 0 && variableOrRule.indexOf(':') !== -1) {
  	          insidePropertyValue = true;
  	          this.indent();

  	          // might be a nesting at-rule
  	        } else if (variableOrRule in this.NESTED_AT_RULE) {
  	          this._nestedLevel += 1;
  	          if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
  	            enteringConditionalGroup = true;
  	          }

  	          // might be a non-nested at-rule
  	        } else if (parenLevel === 0 && !insidePropertyValue) {
  	          insideNonNestedAtRule = true;
  	        }
  	      }
  	    } else if (this._ch === '#' && this._input.peek() === '{') {
  	      this.preserveSingleSpace(isAfterSpace);
  	      this.print_string(this._ch + this.eatString('}'));
  	    } else if (this._ch === '{') {
  	      if (insidePropertyValue) {
  	        insidePropertyValue = false;
  	        this.outdent();
  	      }

  	      // non nested at rule becomes nested
  	      insideNonNestedAtRule = false;

  	      // when entering conditional groups, only rulesets are allowed
  	      if (enteringConditionalGroup) {
  	        enteringConditionalGroup = false;
  	        insideRule = (this._indentLevel >= this._nestedLevel);
  	      } else {
  	        // otherwise, declarations are also allowed
  	        insideRule = (this._indentLevel >= this._nestedLevel - 1);
  	      }
  	      if (this._options.newline_between_rules && insideRule) {
  	        if (this._output.previous_line && this._output.previous_line.item(-1) !== '{') {
  	          this._output.ensure_empty_line_above('/', ',');
  	        }
  	      }

  	      this._output.space_before_token = true;

  	      // The difference in print_string and indent order is necessary to indent the '{' correctly
  	      if (this._options.brace_style === 'expand') {
  	        this._output.add_new_line();
  	        this.print_string(this._ch);
  	        this.indent();
  	        this._output.set_indent(this._indentLevel);
  	      } else {
  	        // inside mixin and first param is object
  	        if (previous_ch === '(') {
  	          this._output.space_before_token = false;
  	        } else if (previous_ch !== ',') {
  	          this.indent();
  	        }
  	        this.print_string(this._ch);
  	      }

  	      this.eatWhitespace(true);
  	      this._output.add_new_line();
  	    } else if (this._ch === '}') {
  	      this.outdent();
  	      this._output.add_new_line();
  	      if (previous_ch === '{') {
  	        this._output.trim(true);
  	      }

  	      if (insidePropertyValue) {
  	        this.outdent();
  	        insidePropertyValue = false;
  	      }
  	      this.print_string(this._ch);
  	      insideRule = false;
  	      if (this._nestedLevel) {
  	        this._nestedLevel--;
  	      }

  	      this.eatWhitespace(true);
  	      this._output.add_new_line();

  	      if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
  	        if (this._input.peek() !== '}') {
  	          this._output.add_new_line(true);
  	        }
  	      }
  	      if (this._input.peek() === ')') {
  	        this._output.trim(true);
  	        if (this._options.brace_style === "expand") {
  	          this._output.add_new_line(true);
  	        }
  	      }
  	    } else if (this._ch === ":") {

  	      for (var i = 0; i < this.NON_SEMICOLON_NEWLINE_PROPERTY.length; i++) {
  	        if (this._input.lookBack(this.NON_SEMICOLON_NEWLINE_PROPERTY[i])) {
  	          insideNonSemiColonValues = true;
  	          break;
  	        }
  	      }

  	      if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideNonNestedAtRule && parenLevel === 0) {
  	        // 'property: value' delimiter
  	        // which could be in a conditional group query

  	        this.print_string(':');
  	        if (!insidePropertyValue) {
  	          insidePropertyValue = true;
  	          this._output.space_before_token = true;
  	          this.eatWhitespace(true);
  	          this.indent();
  	        }
  	      } else {
  	        // sass/less parent reference don't use a space
  	        // sass nested pseudo-class don't use a space

  	        // preserve space before pseudoclasses/pseudoelements, as it means "in any child"
  	        if (this._input.lookBack(" ")) {
  	          this._output.space_before_token = true;
  	        }
  	        if (this._input.peek() === ":") {
  	          // pseudo-element
  	          this._ch = this._input.next();
  	          this.print_string("::");
  	        } else {
  	          // pseudo-class
  	          this.print_string(':');
  	        }
  	      }
  	    } else if (this._ch === '"' || this._ch === '\'') {
  	      var preserveQuoteSpace = previous_ch === '"' || previous_ch === '\'';
  	      this.preserveSingleSpace(preserveQuoteSpace || isAfterSpace);
  	      this.print_string(this._ch + this.eatString(this._ch));
  	      this.eatWhitespace(true);
  	    } else if (this._ch === ';') {
  	      insideNonSemiColonValues = false;
  	      if (parenLevel === 0) {
  	        if (insidePropertyValue) {
  	          this.outdent();
  	          insidePropertyValue = false;
  	        }
  	        insideNonNestedAtRule = false;
  	        this.print_string(this._ch);
  	        this.eatWhitespace(true);

  	        // This maintains single line comments on the same
  	        // line. Block comments are also affected, but
  	        // a new line is always output before one inside
  	        // that section
  	        if (this._input.peek() !== '/') {
  	          this._output.add_new_line();
  	        }
  	      } else {
  	        this.print_string(this._ch);
  	        this.eatWhitespace(true);
  	        this._output.space_before_token = true;
  	      }
  	    } else if (this._ch === '(') { // may be a url
  	      if (this._input.lookBack("url")) {
  	        this.print_string(this._ch);
  	        this.eatWhitespace();
  	        parenLevel++;
  	        this.indent();
  	        this._ch = this._input.next();
  	        if (this._ch === ')' || this._ch === '"' || this._ch === '\'') {
  	          this._input.back();
  	        } else if (this._ch) {
  	          this.print_string(this._ch + this.eatString(')'));
  	          if (parenLevel) {
  	            parenLevel--;
  	            this.outdent();
  	          }
  	        }
  	      } else {
  	        var space_needed = false;
  	        if (this._input.lookBack("with")) {
  	          // look back is not an accurate solution, we need tokens to confirm without whitespaces
  	          space_needed = true;
  	        }
  	        this.preserveSingleSpace(isAfterSpace || space_needed);
  	        this.print_string(this._ch);

  	        // handle scss/sass map
  	        if (insidePropertyValue && previous_ch === "$" && this._options.selector_separator_newline) {
  	          this._output.add_new_line();
  	          insideScssMap = true;
  	        } else {
  	          this.eatWhitespace();
  	          parenLevel++;
  	          this.indent();
  	        }
  	      }
  	    } else if (this._ch === ')') {
  	      if (parenLevel) {
  	        parenLevel--;
  	        this.outdent();
  	      }
  	      if (insideScssMap && this._input.peek() === ";" && this._options.selector_separator_newline) {
  	        insideScssMap = false;
  	        this.outdent();
  	        this._output.add_new_line();
  	      }
  	      this.print_string(this._ch);
  	    } else if (this._ch === ',') {
  	      this.print_string(this._ch);
  	      this.eatWhitespace(true);
  	      if (this._options.selector_separator_newline && (!insidePropertyValue || insideScssMap) && parenLevel === 0 && !insideNonNestedAtRule) {
  	        this._output.add_new_line();
  	      } else {
  	        this._output.space_before_token = true;
  	      }
  	    } else if ((this._ch === '>' || this._ch === '+' || this._ch === '~') && !insidePropertyValue && parenLevel === 0) {
  	      //handle combinator spacing
  	      if (this._options.space_around_combinator) {
  	        this._output.space_before_token = true;
  	        this.print_string(this._ch);
  	        this._output.space_before_token = true;
  	      } else {
  	        this.print_string(this._ch);
  	        this.eatWhitespace();
  	        // squash extra whitespace
  	        if (this._ch && whitespaceChar.test(this._ch)) {
  	          this._ch = '';
  	        }
  	      }
  	    } else if (this._ch === ']') {
  	      this.print_string(this._ch);
  	    } else if (this._ch === '[') {
  	      this.preserveSingleSpace(isAfterSpace);
  	      this.print_string(this._ch);
  	    } else if (this._ch === '=') { // no whitespace before or after
  	      this.eatWhitespace();
  	      this.print_string('=');
  	      if (whitespaceChar.test(this._ch)) {
  	        this._ch = '';
  	      }
  	    } else if (this._ch === '!' && !this._input.lookBack("\\")) { // !important
  	      this._output.space_before_token = true;
  	      this.print_string(this._ch);
  	    } else {
  	      var preserveAfterSpace = previous_ch === '"' || previous_ch === '\'';
  	      this.preserveSingleSpace(preserveAfterSpace || isAfterSpace);
  	      this.print_string(this._ch);

  	      if (!this._output.just_added_newline() && this._input.peek() === '\n' && insideNonSemiColonValues) {
  	        this._output.add_new_line();
  	      }
  	    }
  	  }

  	  var sweetCode = this._output.get_code(eol);

  	  return sweetCode;
  	};

  	beautifier$1.Beautifier = Beautifier;
  	return beautifier$1;
  }

  /*jshint node:true */

  var hasRequiredCss;

  function requireCss () {
  	if (hasRequiredCss) return css.exports;
  	hasRequiredCss = 1;

  	var Beautifier = requireBeautifier$1().Beautifier,
  	  Options = requireOptions$1().Options;

  	function css_beautify(source_text, options) {
  	  var beautifier = new Beautifier(source_text, options);
  	  return beautifier.beautify();
  	}

  	css.exports = css_beautify;
  	css.exports.defaultOptions = function() {
  	  return new Options();
  	};
  	return css.exports;
  }

  var html = {exports: {}};

  var beautifier = {};

  var options = {};

  /*jshint node:true */

  var hasRequiredOptions;

  function requireOptions () {
  	if (hasRequiredOptions) return options;
  	hasRequiredOptions = 1;

  	var BaseOptions = requireOptions$3().Options;

  	function Options(options) {
  	  BaseOptions.call(this, options, 'html');
  	  if (this.templating.length === 1 && this.templating[0] === 'auto') {
  	    this.templating = ['django', 'erb', 'handlebars', 'php'];
  	  }

  	  this.indent_inner_html = this._get_boolean('indent_inner_html');
  	  this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
  	  this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

  	  this.indent_handlebars = this._get_boolean('indent_handlebars', true);
  	  this.wrap_attributes = this._get_selection('wrap_attributes',
  	    ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
  	  this.wrap_attributes_min_attrs = this._get_number('wrap_attributes_min_attrs', 2);
  	  this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
  	  this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

  	  // Block vs inline elements
  	  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  	  // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
  	  // https://www.w3.org/TR/html5/dom.html#phrasing-content
  	  this.inline = this._get_array('inline', [
  	    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
  	    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
  	    'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
  	    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
  	    'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
  	    'video', 'wbr', 'text',
  	    // obsolete inline tags
  	    'acronym', 'big', 'strike', 'tt'
  	  ]);
  	  this.inline_custom_elements = this._get_boolean('inline_custom_elements', true);
  	  this.void_elements = this._get_array('void_elements', [
  	    // HTLM void elements - aka self-closing tags - aka singletons
  	    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
  	    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
  	    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
  	    // NOTE: Optional tags are too complex for a simple list
  	    // they are hard coded in _do_optional_end_element

  	    // Doctype and xml elements
  	    '!doctype', '?xml',

  	    // obsolete tags
  	    // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
  	    // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
  	    'basefont', 'isindex'
  	  ]);
  	  this.unformatted = this._get_array('unformatted', []);
  	  this.content_unformatted = this._get_array('content_unformatted', [
  	    'pre', 'textarea'
  	  ]);
  	  this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
  	  this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);

  	}
  	Options.prototype = new BaseOptions();



  	options.Options = Options;
  	return options;
  }

  var tokenizer = {};

  /*jshint node:true */

  var hasRequiredTokenizer;

  function requireTokenizer () {
  	if (hasRequiredTokenizer) return tokenizer;
  	hasRequiredTokenizer = 1;

  	var BaseTokenizer = requireTokenizer$2().Tokenizer;
  	var BASETOKEN = requireTokenizer$2().TOKEN;
  	var Directives = requireDirectives().Directives;
  	var TemplatablePattern = requireTemplatablepattern().TemplatablePattern;
  	var Pattern = requirePattern().Pattern;

  	var TOKEN = {
  	  TAG_OPEN: 'TK_TAG_OPEN',
  	  TAG_CLOSE: 'TK_TAG_CLOSE',
  	  ATTRIBUTE: 'TK_ATTRIBUTE',
  	  EQUALS: 'TK_EQUALS',
  	  VALUE: 'TK_VALUE',
  	  COMMENT: 'TK_COMMENT',
  	  TEXT: 'TK_TEXT',
  	  UNKNOWN: 'TK_UNKNOWN',
  	  START: BASETOKEN.START,
  	  RAW: BASETOKEN.RAW,
  	  EOF: BASETOKEN.EOF
  	};

  	var directives_core = new Directives(/<\!--/, /-->/);

  	var Tokenizer = function(input_string, options) {
  	  BaseTokenizer.call(this, input_string, options);
  	  this._current_tag_name = '';

  	  // Words end at whitespace or when a tag starts
  	  // if we are indenting handlebars, they are considered tags
  	  var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
  	  var pattern_reader = new Pattern(this._input);

  	  this.__patterns = {
  	    word: templatable_reader.until(/[\n\r\t <]/),
  	    single_quote: templatable_reader.until_after(/'/),
  	    double_quote: templatable_reader.until_after(/"/),
  	    attribute: templatable_reader.until(/[\n\r\t =>]|\/>/),
  	    element_name: templatable_reader.until(/[\n\r\t >\/]/),

  	    handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
  	    handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
  	    handlebars_open: pattern_reader.until(/[\n\r\t }]/),
  	    handlebars_raw_close: pattern_reader.until(/}}/),
  	    comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
  	    cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
  	    // https://en.wikipedia.org/wiki/Conditional_comment
  	    conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
  	    processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
  	  };

  	  if (this._options.indent_handlebars) {
  	    this.__patterns.word = this.__patterns.word.exclude('handlebars');
  	  }

  	  this._unformatted_content_delimiter = null;

  	  if (this._options.unformatted_content_delimiter) {
  	    var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
  	    this.__patterns.unformatted_content_delimiter =
  	      pattern_reader.matching(literal_regexp)
  	      .until_after(literal_regexp);
  	  }
  	};
  	Tokenizer.prototype = new BaseTokenizer();

  	Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
  	  return false; //current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.UNKNOWN;
  	};

  	Tokenizer.prototype._is_opening = function(current_token) {
  	  return current_token.type === TOKEN.TAG_OPEN;
  	};

  	Tokenizer.prototype._is_closing = function(current_token, open_token) {
  	  return current_token.type === TOKEN.TAG_CLOSE &&
  	    (open_token && (
  	      ((current_token.text === '>' || current_token.text === '/>') && open_token.text[0] === '<') ||
  	      (current_token.text === '}}' && open_token.text[0] === '{' && open_token.text[1] === '{')));
  	};

  	Tokenizer.prototype._reset = function() {
  	  this._current_tag_name = '';
  	};

  	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
  	  var token = null;
  	  this._readWhitespace();
  	  var c = this._input.peek();

  	  if (c === null) {
  	    return this._create_token(TOKEN.EOF, '');
  	  }

  	  token = token || this._read_open_handlebars(c, open_token);
  	  token = token || this._read_attribute(c, previous_token, open_token);
  	  token = token || this._read_close(c, open_token);
  	  token = token || this._read_raw_content(c, previous_token, open_token);
  	  token = token || this._read_content_word(c);
  	  token = token || this._read_comment_or_cdata(c);
  	  token = token || this._read_processing(c);
  	  token = token || this._read_open(c, open_token);
  	  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

  	  return token;
  	};

  	Tokenizer.prototype._read_comment_or_cdata = function(c) { // jshint unused:false
  	  var token = null;
  	  var resulting_string = null;
  	  var directives = null;

  	  if (c === '<') {
  	    var peek1 = this._input.peek(1);
  	    // We treat all comments as literals, even more than preformatted tags
  	    // we only look for the appropriate closing marker
  	    if (peek1 === '!') {
  	      resulting_string = this.__patterns.comment.read();

  	      // only process directive on html comments
  	      if (resulting_string) {
  	        directives = directives_core.get_directives(resulting_string);
  	        if (directives && directives.ignore === 'start') {
  	          resulting_string += directives_core.readIgnored(this._input);
  	        }
  	      } else {
  	        resulting_string = this.__patterns.cdata.read();
  	      }
  	    }

  	    if (resulting_string) {
  	      token = this._create_token(TOKEN.COMMENT, resulting_string);
  	      token.directives = directives;
  	    }
  	  }

  	  return token;
  	};

  	Tokenizer.prototype._read_processing = function(c) { // jshint unused:false
  	  var token = null;
  	  var resulting_string = null;
  	  var directives = null;

  	  if (c === '<') {
  	    var peek1 = this._input.peek(1);
  	    if (peek1 === '!' || peek1 === '?') {
  	      resulting_string = this.__patterns.conditional_comment.read();
  	      resulting_string = resulting_string || this.__patterns.processing.read();
  	    }

  	    if (resulting_string) {
  	      token = this._create_token(TOKEN.COMMENT, resulting_string);
  	      token.directives = directives;
  	    }
  	  }

  	  return token;
  	};

  	Tokenizer.prototype._read_open = function(c, open_token) {
  	  var resulting_string = null;
  	  var token = null;
  	  if (!open_token) {
  	    if (c === '<') {

  	      resulting_string = this._input.next();
  	      if (this._input.peek() === '/') {
  	        resulting_string += this._input.next();
  	      }
  	      resulting_string += this.__patterns.element_name.read();
  	      token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
  	    }
  	  }
  	  return token;
  	};

  	Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
  	  var resulting_string = null;
  	  var token = null;
  	  if (!open_token) {
  	    if (this._options.indent_handlebars && c === '{' && this._input.peek(1) === '{') {
  	      if (this._input.peek(2) === '!') {
  	        resulting_string = this.__patterns.handlebars_comment.read();
  	        resulting_string = resulting_string || this.__patterns.handlebars.read();
  	        token = this._create_token(TOKEN.COMMENT, resulting_string);
  	      } else {
  	        resulting_string = this.__patterns.handlebars_open.read();
  	        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
  	      }
  	    }
  	  }
  	  return token;
  	};


  	Tokenizer.prototype._read_close = function(c, open_token) {
  	  var resulting_string = null;
  	  var token = null;
  	  if (open_token) {
  	    if (open_token.text[0] === '<' && (c === '>' || (c === '/' && this._input.peek(1) === '>'))) {
  	      resulting_string = this._input.next();
  	      if (c === '/') { //  for close tag "/>"
  	        resulting_string += this._input.next();
  	      }
  	      token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
  	    } else if (open_token.text[0] === '{' && c === '}' && this._input.peek(1) === '}') {
  	      this._input.next();
  	      this._input.next();
  	      token = this._create_token(TOKEN.TAG_CLOSE, '}}');
  	    }
  	  }

  	  return token;
  	};

  	Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
  	  var token = null;
  	  var resulting_string = '';
  	  if (open_token && open_token.text[0] === '<') {

  	    if (c === '=') {
  	      token = this._create_token(TOKEN.EQUALS, this._input.next());
  	    } else if (c === '"' || c === "'") {
  	      var content = this._input.next();
  	      if (c === '"') {
  	        content += this.__patterns.double_quote.read();
  	      } else {
  	        content += this.__patterns.single_quote.read();
  	      }
  	      token = this._create_token(TOKEN.VALUE, content);
  	    } else {
  	      resulting_string = this.__patterns.attribute.read();

  	      if (resulting_string) {
  	        if (previous_token.type === TOKEN.EQUALS) {
  	          token = this._create_token(TOKEN.VALUE, resulting_string);
  	        } else {
  	          token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
  	        }
  	      }
  	    }
  	  }
  	  return token;
  	};

  	Tokenizer.prototype._is_content_unformatted = function(tag_name) {
  	  // void_elements have no content and so cannot have unformatted content
  	  // script and style tags should always be read as unformatted content
  	  // finally content_unformatted and unformatted element contents are unformatted
  	  return this._options.void_elements.indexOf(tag_name) === -1 &&
  	    (this._options.content_unformatted.indexOf(tag_name) !== -1 ||
  	      this._options.unformatted.indexOf(tag_name) !== -1);
  	};


  	Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) { // jshint unused:false
  	  var resulting_string = '';
  	  if (open_token && open_token.text[0] === '{') {
  	    resulting_string = this.__patterns.handlebars_raw_close.read();
  	  } else if (previous_token.type === TOKEN.TAG_CLOSE &&
  	    previous_token.opened.text[0] === '<' && previous_token.text[0] !== '/') {
  	    // ^^ empty tag has no content 
  	    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
  	    if (tag_name === 'script' || tag_name === 'style') {
  	      // Script and style tags are allowed to have comments wrapping their content
  	      // or just have regular content.
  	      var token = this._read_comment_or_cdata(c);
  	      if (token) {
  	        token.type = TOKEN.TEXT;
  	        return token;
  	      }
  	      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
  	    } else if (this._is_content_unformatted(tag_name)) {

  	      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
  	    }
  	  }

  	  if (resulting_string) {
  	    return this._create_token(TOKEN.TEXT, resulting_string);
  	  }

  	  return null;
  	};

  	Tokenizer.prototype._read_content_word = function(c) {
  	  var resulting_string = '';
  	  if (this._options.unformatted_content_delimiter) {
  	    if (c === this._options.unformatted_content_delimiter[0]) {
  	      resulting_string = this.__patterns.unformatted_content_delimiter.read();
  	    }
  	  }

  	  if (!resulting_string) {
  	    resulting_string = this.__patterns.word.read();
  	  }
  	  if (resulting_string) {
  	    return this._create_token(TOKEN.TEXT, resulting_string);
  	  }
  	};

  	tokenizer.Tokenizer = Tokenizer;
  	tokenizer.TOKEN = TOKEN;
  	return tokenizer;
  }

  /*jshint node:true */

  var hasRequiredBeautifier;

  function requireBeautifier () {
  	if (hasRequiredBeautifier) return beautifier;
  	hasRequiredBeautifier = 1;

  	var Options = requireOptions().Options;
  	var Output = requireOutput().Output;
  	var Tokenizer = requireTokenizer().Tokenizer;
  	var TOKEN = requireTokenizer().TOKEN;

  	var lineBreak = /\r\n|[\r\n]/;
  	var allLineBreaks = /\r\n|[\r\n]/g;

  	var Printer = function(options, base_indent_string) { //handles input/output and some other printing functions

  	  this.indent_level = 0;
  	  this.alignment_size = 0;
  	  this.max_preserve_newlines = options.max_preserve_newlines;
  	  this.preserve_newlines = options.preserve_newlines;

  	  this._output = new Output(options, base_indent_string);

  	};

  	Printer.prototype.current_line_has_match = function(pattern) {
  	  return this._output.current_line.has_match(pattern);
  	};

  	Printer.prototype.set_space_before_token = function(value, non_breaking) {
  	  this._output.space_before_token = value;
  	  this._output.non_breaking_space = non_breaking;
  	};

  	Printer.prototype.set_wrap_point = function() {
  	  this._output.set_indent(this.indent_level, this.alignment_size);
  	  this._output.set_wrap_point();
  	};


  	Printer.prototype.add_raw_token = function(token) {
  	  this._output.add_raw_token(token);
  	};

  	Printer.prototype.print_preserved_newlines = function(raw_token) {
  	  var newlines = 0;
  	  if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
  	    newlines = raw_token.newlines ? 1 : 0;
  	  }

  	  if (this.preserve_newlines) {
  	    newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
  	  }
  	  for (var n = 0; n < newlines; n++) {
  	    this.print_newline(n > 0);
  	  }

  	  return newlines !== 0;
  	};

  	Printer.prototype.traverse_whitespace = function(raw_token) {
  	  if (raw_token.whitespace_before || raw_token.newlines) {
  	    if (!this.print_preserved_newlines(raw_token)) {
  	      this._output.space_before_token = true;
  	    }
  	    return true;
  	  }
  	  return false;
  	};

  	Printer.prototype.previous_token_wrapped = function() {
  	  return this._output.previous_token_wrapped;
  	};

  	Printer.prototype.print_newline = function(force) {
  	  this._output.add_new_line(force);
  	};

  	Printer.prototype.print_token = function(token) {
  	  if (token.text) {
  	    this._output.set_indent(this.indent_level, this.alignment_size);
  	    this._output.add_token(token.text);
  	  }
  	};

  	Printer.prototype.indent = function() {
  	  this.indent_level++;
  	};

  	Printer.prototype.get_full_indent = function(level) {
  	  level = this.indent_level + (level || 0);
  	  if (level < 1) {
  	    return '';
  	  }

  	  return this._output.get_indent_string(level);
  	};

  	var get_type_attribute = function(start_token) {
  	  var result = null;
  	  var raw_token = start_token.next;

  	  // Search attributes for a type attribute
  	  while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
  	    if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === 'type') {
  	      if (raw_token.next && raw_token.next.type === TOKEN.EQUALS &&
  	        raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
  	        result = raw_token.next.next.text;
  	      }
  	      break;
  	    }
  	    raw_token = raw_token.next;
  	  }

  	  return result;
  	};

  	var get_custom_beautifier_name = function(tag_check, raw_token) {
  	  var typeAttribute = null;
  	  var result = null;

  	  if (!raw_token.closed) {
  	    return null;
  	  }

  	  if (tag_check === 'script') {
  	    typeAttribute = 'text/javascript';
  	  } else if (tag_check === 'style') {
  	    typeAttribute = 'text/css';
  	  }

  	  typeAttribute = get_type_attribute(raw_token) || typeAttribute;

  	  // For script and style tags that have a type attribute, only enable custom beautifiers for matching values
  	  // For those without a type attribute use default;
  	  if (typeAttribute.search('text/css') > -1) {
  	    result = 'css';
  	  } else if (typeAttribute.search(/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/) > -1) {
  	    result = 'javascript';
  	  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
  	    result = 'html';
  	  } else if (typeAttribute.search(/test\/null/) > -1) {
  	    // Test only mime-type for testing the beautifier when null is passed as beautifing function
  	    result = 'null';
  	  }

  	  return result;
  	};

  	function in_array(what, arr) {
  	  return arr.indexOf(what) !== -1;
  	}

  	function TagFrame(parent, parser_token, indent_level) {
  	  this.parent = parent || null;
  	  this.tag = parser_token ? parser_token.tag_name : '';
  	  this.indent_level = indent_level || 0;
  	  this.parser_token = parser_token || null;
  	}

  	function TagStack(printer) {
  	  this._printer = printer;
  	  this._current_frame = null;
  	}

  	TagStack.prototype.get_parser_token = function() {
  	  return this._current_frame ? this._current_frame.parser_token : null;
  	};

  	TagStack.prototype.record_tag = function(parser_token) { //function to record a tag and its parent in this.tags Object
  	  var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
  	  this._current_frame = new_frame;
  	};

  	TagStack.prototype._try_pop_frame = function(frame) { //function to retrieve the opening tag to the corresponding closer
  	  var parser_token = null;

  	  if (frame) {
  	    parser_token = frame.parser_token;
  	    this._printer.indent_level = frame.indent_level;
  	    this._current_frame = frame.parent;
  	  }

  	  return parser_token;
  	};

  	TagStack.prototype._get_frame = function(tag_list, stop_list) { //function to retrieve the opening tag to the corresponding closer
  	  var frame = this._current_frame;

  	  while (frame) { //till we reach '' (the initial value);
  	    if (tag_list.indexOf(frame.tag) !== -1) { //if this is it use it
  	      break;
  	    } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
  	      frame = null;
  	      break;
  	    }
  	    frame = frame.parent;
  	  }

  	  return frame;
  	};

  	TagStack.prototype.try_pop = function(tag, stop_list) { //function to retrieve the opening tag to the corresponding closer
  	  var frame = this._get_frame([tag], stop_list);
  	  return this._try_pop_frame(frame);
  	};

  	TagStack.prototype.indent_to_tag = function(tag_list) {
  	  var frame = this._get_frame(tag_list);
  	  if (frame) {
  	    this._printer.indent_level = frame.indent_level;
  	  }
  	};

  	function Beautifier(source_text, options, js_beautify, css_beautify) {
  	  //Wrapper function to invoke all the necessary constructors and deal with the output.
  	  this._source_text = source_text || '';
  	  options = options || {};
  	  this._js_beautify = js_beautify;
  	  this._css_beautify = css_beautify;
  	  this._tag_stack = null;

  	  // Allow the setting of language/file-type specific options
  	  // with inheritance of overall settings
  	  var optionHtml = new Options(options, 'html');

  	  this._options = optionHtml;

  	  this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, 'force'.length) === 'force';
  	  this._is_wrap_attributes_force_expand_multiline = (this._options.wrap_attributes === 'force-expand-multiline');
  	  this._is_wrap_attributes_force_aligned = (this._options.wrap_attributes === 'force-aligned');
  	  this._is_wrap_attributes_aligned_multiple = (this._options.wrap_attributes === 'aligned-multiple');
  	  this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, 'preserve'.length) === 'preserve';
  	  this._is_wrap_attributes_preserve_aligned = (this._options.wrap_attributes === 'preserve-aligned');
  	}

  	Beautifier.prototype.beautify = function() {

  	  // if disabled, return the input unchanged.
  	  if (this._options.disabled) {
  	    return this._source_text;
  	  }

  	  var source_text = this._source_text;
  	  var eol = this._options.eol;
  	  if (this._options.eol === 'auto') {
  	    eol = '\n';
  	    if (source_text && lineBreak.test(source_text)) {
  	      eol = source_text.match(lineBreak)[0];
  	    }
  	  }

  	  // HACK: newline parsing inconsistent. This brute force normalizes the input.
  	  source_text = source_text.replace(allLineBreaks, '\n');

  	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

  	  var last_token = {
  	    text: '',
  	    type: ''
  	  };

  	  var last_tag_token = new TagOpenParserToken();

  	  var printer = new Printer(this._options, baseIndentString);
  	  var tokens = new Tokenizer(source_text, this._options).tokenize();

  	  this._tag_stack = new TagStack(printer);

  	  var parser_token = null;
  	  var raw_token = tokens.next();
  	  while (raw_token.type !== TOKEN.EOF) {

  	    if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
  	      parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token, tokens);
  	      last_tag_token = parser_token;
  	    } else if ((raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE) ||
  	      (raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete)) {
  	      parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, last_token);
  	    } else if (raw_token.type === TOKEN.TAG_CLOSE) {
  	      parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
  	    } else if (raw_token.type === TOKEN.TEXT) {
  	      parser_token = this._handle_text(printer, raw_token, last_tag_token);
  	    } else {
  	      // This should never happen, but if it does. Print the raw token
  	      printer.add_raw_token(raw_token);
  	    }

  	    last_token = parser_token;

  	    raw_token = tokens.next();
  	  }
  	  var sweet_code = printer._output.get_code(eol);

  	  return sweet_code;
  	};

  	Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
  	  var parser_token = {
  	    text: raw_token.text,
  	    type: raw_token.type
  	  };
  	  printer.alignment_size = 0;
  	  last_tag_token.tag_complete = true;

  	  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  	  if (last_tag_token.is_unformatted) {
  	    printer.add_raw_token(raw_token);
  	  } else {
  	    if (last_tag_token.tag_start_char === '<') {
  	      printer.set_space_before_token(raw_token.text[0] === '/', true); // space before />, no space before >
  	      if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
  	        printer.print_newline(false);
  	      }
  	    }
  	    printer.print_token(raw_token);

  	  }

  	  if (last_tag_token.indent_content &&
  	    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
  	    printer.indent();

  	    // only indent once per opened tag
  	    last_tag_token.indent_content = false;
  	  }

  	  if (!last_tag_token.is_inline_element &&
  	    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
  	    printer.set_wrap_point();
  	  }

  	  return parser_token;
  	};

  	Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, last_token) {
  	  var wrapped = last_tag_token.has_wrapped_attrs;
  	  var parser_token = {
  	    text: raw_token.text,
  	    type: raw_token.type
  	  };

  	  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
  	  if (last_tag_token.is_unformatted) {
  	    printer.add_raw_token(raw_token);
  	  } else if (last_tag_token.tag_start_char === '{' && raw_token.type === TOKEN.TEXT) {
  	    // For the insides of handlebars allow newlines or a single space between open and contents
  	    if (printer.print_preserved_newlines(raw_token)) {
  	      raw_token.newlines = 0;
  	      printer.add_raw_token(raw_token);
  	    } else {
  	      printer.print_token(raw_token);
  	    }
  	  } else {
  	    if (raw_token.type === TOKEN.ATTRIBUTE) {
  	      printer.set_space_before_token(true);
  	    } else if (raw_token.type === TOKEN.EQUALS) { //no space before =
  	      printer.set_space_before_token(false);
  	    } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) { //no space before value
  	      printer.set_space_before_token(false);
  	    }

  	    if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === '<') {
  	      if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
  	        printer.traverse_whitespace(raw_token);
  	        wrapped = wrapped || raw_token.newlines !== 0;
  	      }

  	      // Wrap for 'force' options, and if the number of attributes is at least that specified in 'wrap_attributes_min_attrs':
  	      // 1. always wrap the second and beyond attributes
  	      // 2. wrap the first attribute only if 'force-expand-multiline' is specified
  	      if (this._is_wrap_attributes_force &&
  	        last_tag_token.attr_count >= this._options.wrap_attributes_min_attrs &&
  	        (last_token.type !== TOKEN.TAG_OPEN || // ie. second attribute and beyond
  	          this._is_wrap_attributes_force_expand_multiline)) {
  	        printer.print_newline(false);
  	        wrapped = true;
  	      }
  	    }
  	    printer.print_token(raw_token);
  	    wrapped = wrapped || printer.previous_token_wrapped();
  	    last_tag_token.has_wrapped_attrs = wrapped;
  	  }
  	  return parser_token;
  	};

  	Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
  	  var parser_token = {
  	    text: raw_token.text,
  	    type: 'TK_CONTENT'
  	  };
  	  if (last_tag_token.custom_beautifier_name) { //check if we need to format javascript
  	    this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
  	  } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
  	    printer.add_raw_token(raw_token);
  	  } else {
  	    printer.traverse_whitespace(raw_token);
  	    printer.print_token(raw_token);
  	  }
  	  return parser_token;
  	};

  	Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
  	  var local = this;
  	  if (raw_token.text !== '') {

  	    var text = raw_token.text,
  	      _beautifier,
  	      script_indent_level = 1,
  	      pre = '',
  	      post = '';
  	    if (last_tag_token.custom_beautifier_name === 'javascript' && typeof this._js_beautify === 'function') {
  	      _beautifier = this._js_beautify;
  	    } else if (last_tag_token.custom_beautifier_name === 'css' && typeof this._css_beautify === 'function') {
  	      _beautifier = this._css_beautify;
  	    } else if (last_tag_token.custom_beautifier_name === 'html') {
  	      _beautifier = function(html_source, options) {
  	        var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
  	        return beautifier.beautify();
  	      };
  	    }

  	    if (this._options.indent_scripts === "keep") {
  	      script_indent_level = 0;
  	    } else if (this._options.indent_scripts === "separate") {
  	      script_indent_level = -printer.indent_level;
  	    }

  	    var indentation = printer.get_full_indent(script_indent_level);

  	    // if there is at least one empty line at the end of this text, strip it
  	    // we'll be adding one back after the text but before the containing tag.
  	    text = text.replace(/\n[ \t]*$/, '');

  	    // Handle the case where content is wrapped in a comment or cdata.
  	    if (last_tag_token.custom_beautifier_name !== 'html' &&
  	      text[0] === '<' && text.match(/^(<!--|<!\[CDATA\[)/)) {
  	      var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);

  	      // if we start to wrap but don't finish, print raw
  	      if (!matched) {
  	        printer.add_raw_token(raw_token);
  	        return;
  	      }

  	      pre = indentation + matched[1] + '\n';
  	      text = matched[4];
  	      if (matched[5]) {
  	        post = indentation + matched[5];
  	      }

  	      // if there is at least one empty line at the end of this text, strip it
  	      // we'll be adding one back after the text but before the containing tag.
  	      text = text.replace(/\n[ \t]*$/, '');

  	      if (matched[2] || matched[3].indexOf('\n') !== -1) {
  	        // if the first line of the non-comment text has spaces
  	        // use that as the basis for indenting in null case.
  	        matched = matched[3].match(/[ \t]+$/);
  	        if (matched) {
  	          raw_token.whitespace_before = matched[0];
  	        }
  	      }
  	    }

  	    if (text) {
  	      if (_beautifier) {

  	        // call the Beautifier if avaliable
  	        var Child_options = function() {
  	          this.eol = '\n';
  	        };
  	        Child_options.prototype = this._options.raw_options;
  	        var child_options = new Child_options();
  	        text = _beautifier(indentation + text, child_options);
  	      } else {
  	        // simply indent the string otherwise
  	        var white = raw_token.whitespace_before;
  	        if (white) {
  	          text = text.replace(new RegExp('\n(' + white + ')?', 'g'), '\n');
  	        }

  	        text = indentation + text.replace(/\n/g, '\n' + indentation);
  	      }
  	    }

  	    if (pre) {
  	      if (!text) {
  	        text = pre + post;
  	      } else {
  	        text = pre + text + '\n' + post;
  	      }
  	    }

  	    printer.print_newline(false);
  	    if (text) {
  	      raw_token.text = text;
  	      raw_token.whitespace_before = '';
  	      raw_token.newlines = 0;
  	      printer.add_raw_token(raw_token);
  	      printer.print_newline(true);
  	    }
  	  }
  	};

  	Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token, tokens) {
  	  var parser_token = this._get_tag_open_token(raw_token);

  	  if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) &&
  	    !last_tag_token.is_empty_element &&
  	    raw_token.type === TOKEN.TAG_OPEN && !parser_token.is_start_tag) {
  	    // End element tags for unformatted or content_unformatted elements
  	    // are printed raw to keep any newlines inside them exactly the same.
  	    printer.add_raw_token(raw_token);
  	    parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
  	  } else {
  	    printer.traverse_whitespace(raw_token);
  	    this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
  	    if (!parser_token.is_inline_element) {
  	      printer.set_wrap_point();
  	    }
  	    printer.print_token(raw_token);
  	  }

  	  // count the number of attributes
  	  if (parser_token.is_start_tag && this._is_wrap_attributes_force) {
  	    var peek_index = 0;
  	    var peek_token;
  	    do {
  	      peek_token = tokens.peek(peek_index);
  	      if (peek_token.type === TOKEN.ATTRIBUTE) {
  	        parser_token.attr_count += 1;
  	      }
  	      peek_index += 1;
  	    } while (peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);
  	  }

  	  //indent attributes an auto, forced, aligned or forced-align line-wrap
  	  if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
  	    parser_token.alignment_size = raw_token.text.length + 1;
  	  }

  	  if (!parser_token.tag_complete && !parser_token.is_unformatted) {
  	    printer.alignment_size = parser_token.alignment_size;
  	  }

  	  return parser_token;
  	};

  	var TagOpenParserToken = function(parent, raw_token) {
  	  this.parent = parent || null;
  	  this.text = '';
  	  this.type = 'TK_TAG_OPEN';
  	  this.tag_name = '';
  	  this.is_inline_element = false;
  	  this.is_unformatted = false;
  	  this.is_content_unformatted = false;
  	  this.is_empty_element = false;
  	  this.is_start_tag = false;
  	  this.is_end_tag = false;
  	  this.indent_content = false;
  	  this.multiline_content = false;
  	  this.custom_beautifier_name = null;
  	  this.start_tag_token = null;
  	  this.attr_count = 0;
  	  this.has_wrapped_attrs = false;
  	  this.alignment_size = 0;
  	  this.tag_complete = false;
  	  this.tag_start_char = '';
  	  this.tag_check = '';

  	  if (!raw_token) {
  	    this.tag_complete = true;
  	  } else {
  	    var tag_check_match;

  	    this.tag_start_char = raw_token.text[0];
  	    this.text = raw_token.text;

  	    if (this.tag_start_char === '<') {
  	      tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
  	      this.tag_check = tag_check_match ? tag_check_match[1] : '';
  	    } else {
  	      tag_check_match = raw_token.text.match(/^{{~?(?:[\^]|#\*?)?([^\s}]+)/);
  	      this.tag_check = tag_check_match ? tag_check_match[1] : '';

  	      // handle "{{#> myPartial}}" or "{{~#> myPartial}}"
  	      if ((raw_token.text.startsWith('{{#>') || raw_token.text.startsWith('{{~#>')) && this.tag_check[0] === '>') {
  	        if (this.tag_check === '>' && raw_token.next !== null) {
  	          this.tag_check = raw_token.next.text.split(' ')[0];
  	        } else {
  	          this.tag_check = raw_token.text.split('>')[1];
  	        }
  	      }
  	    }

  	    this.tag_check = this.tag_check.toLowerCase();

  	    if (raw_token.type === TOKEN.COMMENT) {
  	      this.tag_complete = true;
  	    }

  	    this.is_start_tag = this.tag_check.charAt(0) !== '/';
  	    this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
  	    this.is_end_tag = !this.is_start_tag ||
  	      (raw_token.closed && raw_token.closed.text === '/>');

  	    // if whitespace handler ~ included (i.e. {{~#if true}}), handlebars tags start at pos 3 not pos 2
  	    var handlebar_starts = 2;
  	    if (this.tag_start_char === '{' && this.text.length >= 3) {
  	      if (this.text.charAt(2) === '~') {
  	        handlebar_starts = 3;
  	      }
  	    }

  	    // handlebars tags that don't start with # or ^ are single_tags, and so also start and end.
  	    this.is_end_tag = this.is_end_tag ||
  	      (this.tag_start_char === '{' && (this.text.length < 3 || (/[^#\^]/.test(this.text.charAt(handlebar_starts)))));
  	  }
  	};

  	Beautifier.prototype._get_tag_open_token = function(raw_token) { //function to get a full tag and parse its type
  	  var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);

  	  parser_token.alignment_size = this._options.wrap_attributes_indent_size;

  	  parser_token.is_end_tag = parser_token.is_end_tag ||
  	    in_array(parser_token.tag_check, this._options.void_elements);

  	  parser_token.is_empty_element = parser_token.tag_complete ||
  	    (parser_token.is_start_tag && parser_token.is_end_tag);

  	  parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
  	  parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
  	  parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || (this._options.inline_custom_elements && parser_token.tag_name.includes("-")) || parser_token.tag_start_char === '{';

  	  return parser_token;
  	};

  	Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {

  	  if (!parser_token.is_empty_element) {
  	    if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
  	      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name); //remove it and all ancestors
  	    } else { // it's a start-tag
  	      // check if this tag is starting an element that has optional end element
  	      // and do an ending needed
  	      if (this._do_optional_end_element(parser_token)) {
  	        if (!parser_token.is_inline_element) {
  	          printer.print_newline(false);
  	        }
  	      }

  	      this._tag_stack.record_tag(parser_token); //push it on the tag stack

  	      if ((parser_token.tag_name === 'script' || parser_token.tag_name === 'style') &&
  	        !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
  	        parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
  	      }
  	    }
  	  }

  	  if (in_array(parser_token.tag_check, this._options.extra_liners)) { //check if this double needs an extra line
  	    printer.print_newline(false);
  	    if (!printer._output.just_added_blankline()) {
  	      printer.print_newline(true);
  	    }
  	  }

  	  if (parser_token.is_empty_element) { //if this tag name is a single tag type (either in the list or has a closing /)

  	    // if you hit an else case, reset the indent level if you are inside an:
  	    // 'if', 'unless', or 'each' block.
  	    if (parser_token.tag_start_char === '{' && parser_token.tag_check === 'else') {
  	      this._tag_stack.indent_to_tag(['if', 'unless', 'each']);
  	      parser_token.indent_content = true;
  	      // Don't add a newline if opening {{#if}} tag is on the current line
  	      var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
  	      if (!foundIfOnCurrentLine) {
  	        printer.print_newline(false);
  	      }
  	    }

  	    // Don't add a newline before elements that should remain where they are.
  	    if (parser_token.tag_name === '!--' && last_token.type === TOKEN.TAG_CLOSE &&
  	      last_tag_token.is_end_tag && parser_token.text.indexOf('\n') === -1) ; else {
  	      if (!(parser_token.is_inline_element || parser_token.is_unformatted)) {
  	        printer.print_newline(false);
  	      }
  	      this._calcluate_parent_multiline(printer, parser_token);
  	    }
  	  } else if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
  	    var do_end_expand = false;

  	    // deciding whether a block is multiline should not be this hard
  	    do_end_expand = parser_token.start_tag_token && parser_token.start_tag_token.multiline_content;
  	    do_end_expand = do_end_expand || (!parser_token.is_inline_element &&
  	      !(last_tag_token.is_inline_element || last_tag_token.is_unformatted) &&
  	      !(last_token.type === TOKEN.TAG_CLOSE && parser_token.start_tag_token === last_tag_token) &&
  	      last_token.type !== 'TK_CONTENT'
  	    );

  	    if (parser_token.is_content_unformatted || parser_token.is_unformatted) {
  	      do_end_expand = false;
  	    }

  	    if (do_end_expand) {
  	      printer.print_newline(false);
  	    }
  	  } else { // it's a start-tag
  	    parser_token.indent_content = !parser_token.custom_beautifier_name;

  	    if (parser_token.tag_start_char === '<') {
  	      if (parser_token.tag_name === 'html') {
  	        parser_token.indent_content = this._options.indent_inner_html;
  	      } else if (parser_token.tag_name === 'head') {
  	        parser_token.indent_content = this._options.indent_head_inner_html;
  	      } else if (parser_token.tag_name === 'body') {
  	        parser_token.indent_content = this._options.indent_body_inner_html;
  	      }
  	    }

  	    if (!(parser_token.is_inline_element || parser_token.is_unformatted) &&
  	      (last_token.type !== 'TK_CONTENT' || parser_token.is_content_unformatted)) {
  	      printer.print_newline(false);
  	    }

  	    this._calcluate_parent_multiline(printer, parser_token);
  	  }
  	};

  	Beautifier.prototype._calcluate_parent_multiline = function(printer, parser_token) {
  	  if (parser_token.parent && printer._output.just_added_newline() &&
  	    !((parser_token.is_inline_element || parser_token.is_unformatted) && parser_token.parent.is_inline_element)) {
  	    parser_token.parent.multiline_content = true;
  	  }
  	};

  	//To be used for <p> tag special case:
  	var p_closers = ['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];
  	var p_parent_excludes = ['a', 'audio', 'del', 'ins', 'map', 'noscript', 'video'];

  	Beautifier.prototype._do_optional_end_element = function(parser_token) {
  	  var result = null;
  	  // NOTE: cases of "if there is no more content in the parent element"
  	  // are handled automatically by the beautifier.
  	  // It assumes parent or ancestor close tag closes all children.
  	  // https://www.w3.org/TR/html5/syntax.html#optional-tags
  	  if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
  	    return;

  	  }

  	  if (parser_token.tag_name === 'body') {
  	    // A head element’s end tag may be omitted if the head element is not immediately followed by a space character or a comment.
  	    result = result || this._tag_stack.try_pop('head');

  	    //} else if (parser_token.tag_name === 'body') {
  	    // DONE: A body element’s end tag may be omitted if the body element is not immediately followed by a comment.

  	  } else if (parser_token.tag_name === 'li') {
  	    // An li element’s end tag may be omitted if the li element is immediately followed by another li element or if there is no more content in the parent element.
  	    result = result || this._tag_stack.try_pop('li', ['ol', 'ul', 'menu']);

  	  } else if (parser_token.tag_name === 'dd' || parser_token.tag_name === 'dt') {
  	    // A dd element’s end tag may be omitted if the dd element is immediately followed by another dd element or a dt element, or if there is no more content in the parent element.
  	    // A dt element’s end tag may be omitted if the dt element is immediately followed by another dt element or a dd element.
  	    result = result || this._tag_stack.try_pop('dt', ['dl']);
  	    result = result || this._tag_stack.try_pop('dd', ['dl']);


  	  } else if (parser_token.parent.tag_name === 'p' && p_closers.indexOf(parser_token.tag_name) !== -1) {
  	    // IMPORTANT: this else-if works because p_closers has no overlap with any other element we look for in this method
  	    // check for the parent element is an HTML element that is not an <a>, <audio>, <del>, <ins>, <map>, <noscript>, or <video> element,  or an autonomous custom element.
  	    // To do this right, this needs to be coded as an inclusion of the inverse of the exclusion above.
  	    // But to start with (if we ignore "autonomous custom elements") the exclusion would be fine.
  	    var p_parent = parser_token.parent.parent;
  	    if (!p_parent || p_parent_excludes.indexOf(p_parent.tag_name) === -1) {
  	      result = result || this._tag_stack.try_pop('p');
  	    }
  	  } else if (parser_token.tag_name === 'rp' || parser_token.tag_name === 'rt') {
  	    // An rt element’s end tag may be omitted if the rt element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
  	    // An rp element’s end tag may be omitted if the rp element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
  	    result = result || this._tag_stack.try_pop('rt', ['ruby', 'rtc']);
  	    result = result || this._tag_stack.try_pop('rp', ['ruby', 'rtc']);

  	  } else if (parser_token.tag_name === 'optgroup') {
  	    // An optgroup element’s end tag may be omitted if the optgroup element is immediately followed by another optgroup element, or if there is no more content in the parent element.
  	    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
  	    result = result || this._tag_stack.try_pop('optgroup', ['select']);
  	    //result = result || this._tag_stack.try_pop('option', ['select']);

  	  } else if (parser_token.tag_name === 'option') {
  	    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
  	    result = result || this._tag_stack.try_pop('option', ['select', 'datalist', 'optgroup']);

  	  } else if (parser_token.tag_name === 'colgroup') {
  	    // DONE: A colgroup element’s end tag may be omitted if the colgroup element is not immediately followed by a space character or a comment.
  	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
  	    result = result || this._tag_stack.try_pop('caption', ['table']);

  	  } else if (parser_token.tag_name === 'thead') {
  	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
  	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
  	    result = result || this._tag_stack.try_pop('caption', ['table']);
  	    result = result || this._tag_stack.try_pop('colgroup', ['table']);

  	    //} else if (parser_token.tag_name === 'caption') {
  	    // DONE: A caption element’s end tag may be omitted if the caption element is not immediately followed by a space character or a comment.

  	  } else if (parser_token.tag_name === 'tbody' || parser_token.tag_name === 'tfoot') {
  	    // A thead element’s end tag may be omitted if the thead element is immediately followed by a tbody or tfoot element.
  	    // A tbody element’s end tag may be omitted if the tbody element is immediately followed by a tbody or tfoot element, or if there is no more content in the parent element.
  	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
  	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
  	    result = result || this._tag_stack.try_pop('caption', ['table']);
  	    result = result || this._tag_stack.try_pop('colgroup', ['table']);
  	    result = result || this._tag_stack.try_pop('thead', ['table']);
  	    result = result || this._tag_stack.try_pop('tbody', ['table']);

  	    //} else if (parser_token.tag_name === 'tfoot') {
  	    // DONE: A tfoot element’s end tag may be omitted if there is no more content in the parent element.

  	  } else if (parser_token.tag_name === 'tr') {
  	    // A tr element’s end tag may be omitted if the tr element is immediately followed by another tr element, or if there is no more content in the parent element.
  	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
  	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
  	    result = result || this._tag_stack.try_pop('caption', ['table']);
  	    result = result || this._tag_stack.try_pop('colgroup', ['table']);
  	    result = result || this._tag_stack.try_pop('tr', ['table', 'thead', 'tbody', 'tfoot']);

  	  } else if (parser_token.tag_name === 'th' || parser_token.tag_name === 'td') {
  	    // A td element’s end tag may be omitted if the td element is immediately followed by a td or th element, or if there is no more content in the parent element.
  	    // A th element’s end tag may be omitted if the th element is immediately followed by a td or th element, or if there is no more content in the parent element.
  	    result = result || this._tag_stack.try_pop('td', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
  	    result = result || this._tag_stack.try_pop('th', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
  	  }

  	  // Start element omission not handled currently
  	  // A head element’s start tag may be omitted if the element is empty, or if the first thing inside the head element is an element.
  	  // A tbody element’s start tag may be omitted if the first thing inside the tbody element is a tr element, and if the element is not immediately preceded by a tbody, thead, or tfoot element whose end tag has been omitted. (It can’t be omitted if the element is empty.)
  	  // A colgroup element’s start tag may be omitted if the first thing inside the colgroup element is a col element, and if the element is not immediately preceded by another colgroup element whose end tag has been omitted. (It can’t be omitted if the element is empty.)

  	  // Fix up the parent of the parser token
  	  parser_token.parent = this._tag_stack.get_parser_token();

  	  return result;
  	};

  	beautifier.Beautifier = Beautifier;
  	return beautifier;
  }

  /*jshint node:true */

  var hasRequiredHtml;

  function requireHtml () {
  	if (hasRequiredHtml) return html.exports;
  	hasRequiredHtml = 1;

  	var Beautifier = requireBeautifier().Beautifier,
  	  Options = requireOptions().Options;

  	function style_html(html_source, options, js_beautify, css_beautify) {
  	  var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
  	  return beautifier.beautify();
  	}

  	html.exports = style_html;
  	html.exports.defaultOptions = function() {
  	  return new Options();
  	};
  	return html.exports;
  }

  /*jshint node:true */

  var hasRequiredSrc;

  function requireSrc () {
  	if (hasRequiredSrc) return src;
  	hasRequiredSrc = 1;

  	var js_beautify = requireJavascript();
  	var css_beautify = requireCss();
  	var html_beautify = requireHtml();

  	function style_html(html_source, options, js, css) {
  	  js = js || js_beautify;
  	  css = css || css_beautify;
  	  return html_beautify(html_source, options, js, css);
  	}
  	style_html.defaultOptions = html_beautify.defaultOptions;

  	src.js = js_beautify;
  	src.css = css_beautify;
  	src.html = style_html;
  	return src;
  }

  /*jshint node:true */

  (function (module) {

  	/**
  	The following batches are equivalent:

  	var beautify_js = require('js-beautify');
  	var beautify_js = require('js-beautify').js;
  	var beautify_js = require('js-beautify').js_beautify;

  	var beautify_css = require('js-beautify').css;
  	var beautify_css = require('js-beautify').css_beautify;

  	var beautify_html = require('js-beautify').html;
  	var beautify_html = require('js-beautify').html_beautify;

  	All methods returned accept two arguments, the source string and an options object.
  	**/

  	function get_beautify(js_beautify, css_beautify, html_beautify) {
  	  // the default is js
  	  var beautify = function(src, config) {
  	    return js_beautify.js_beautify(src, config);
  	  };

  	  // short aliases
  	  beautify.js = js_beautify.js_beautify;
  	  beautify.css = css_beautify.css_beautify;
  	  beautify.html = html_beautify.html_beautify;

  	  // legacy aliases
  	  beautify.js_beautify = js_beautify.js_beautify;
  	  beautify.css_beautify = css_beautify.css_beautify;
  	  beautify.html_beautify = html_beautify.html_beautify;

  	  return beautify;
  	}

  	{
  	  (function(mod) {
  	    var beautifier = requireSrc();
  	    beautifier.js_beautify = beautifier.js;
  	    beautifier.css_beautify = beautifier.css;
  	    beautifier.html_beautify = beautifier.html;

  	    mod.exports = get_beautify(beautifier, beautifier, beautifier);

  	  })(module);
  	} 
  } (js));

  var jsExports = js.exports;

  /*!
   * is-whitespace <https://github.com/jonschlinkert/is-whitespace>
   *
   * Copyright (c) 2014-2015, Jon Schlinkert.
   * Licensed under the MIT License.
   */

  var cache;

  var isWhitespace$1 = function isWhitespace(str) {
    return (typeof str === 'string') && regex().test(str);
  };

  function regex() {
    // ensure that runtime compilation only happens once
    return cache || (cache = new RegExp('^[\\s\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF"]+$'));
  }

  /*!
   * is-extendable <https://github.com/jonschlinkert/is-extendable>
   *
   * Copyright (c) 2015, Jon Schlinkert.
   * Licensed under the MIT License.
   */

  var isExtendable = function isExtendable(val) {
    return typeof val !== 'undefined' && val !== null
      && (typeof val === 'object' || typeof val === 'function');
  };

  var isObject$6 = isExtendable;

  var extendShallow = function extend(o/*, objects*/) {
    if (!isObject$6(o)) { o = {}; }

    var len = arguments.length;
    for (var i = 1; i < len; i++) {
      var obj = arguments[i];

      if (isObject$6(obj)) {
        assign(o, obj);
      }
    }
    return o;
  };

  function assign(a, b) {
    for (var key in b) {
      if (hasOwn(b, key)) {
        a[key] = b[key];
      }
    }
  }

  /**
   * Returns true if the given `key` is an own property of `obj`.
   */

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  var isBuffer_1 = function (obj) {
    return obj != null && (isBuffer$4(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
  };

  function isBuffer$4 (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer$4(obj.slice(0, 0))
  }

  var isBuffer$3 = isBuffer_1;
  var toString = Object.prototype.toString;

  /**
   * Get the native `typeof` a value.
   *
   * @param  {*} `val`
   * @return {*} Native javascript type
   */

  var kindOf = function kindOf(val) {
    // primitivies
    if (typeof val === 'undefined') {
      return 'undefined';
    }
    if (val === null) {
      return 'null';
    }
    if (val === true || val === false || val instanceof Boolean) {
      return 'boolean';
    }
    if (typeof val === 'string' || val instanceof String) {
      return 'string';
    }
    if (typeof val === 'number' || val instanceof Number) {
      return 'number';
    }

    // functions
    if (typeof val === 'function' || val instanceof Function) {
      return 'function';
    }

    // array
    if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
      return 'array';
    }

    // check for instances of RegExp and Date before calling `toString`
    if (val instanceof RegExp) {
      return 'regexp';
    }
    if (val instanceof Date) {
      return 'date';
    }

    // other objects
    var type = toString.call(val);

    if (type === '[object RegExp]') {
      return 'regexp';
    }
    if (type === '[object Date]') {
      return 'date';
    }
    if (type === '[object Arguments]') {
      return 'arguments';
    }
    if (type === '[object Error]') {
      return 'error';
    }

    // buffer
    if (isBuffer$3(val)) {
      return 'buffer';
    }

    // es6: Map, WeakMap, Set, WeakSet
    if (type === '[object Set]') {
      return 'set';
    }
    if (type === '[object WeakSet]') {
      return 'weakset';
    }
    if (type === '[object Map]') {
      return 'map';
    }
    if (type === '[object WeakMap]') {
      return 'weakmap';
    }
    if (type === '[object Symbol]') {
      return 'symbol';
    }

    // typed arrays
    if (type === '[object Int8Array]') {
      return 'int8array';
    }
    if (type === '[object Uint8Array]') {
      return 'uint8array';
    }
    if (type === '[object Uint8ClampedArray]') {
      return 'uint8clampedarray';
    }
    if (type === '[object Int16Array]') {
      return 'int16array';
    }
    if (type === '[object Uint16Array]') {
      return 'uint16array';
    }
    if (type === '[object Int32Array]') {
      return 'int32array';
    }
    if (type === '[object Uint32Array]') {
      return 'uint32array';
    }
    if (type === '[object Float32Array]') {
      return 'float32array';
    }
    if (type === '[object Float64Array]') {
      return 'float64array';
    }

    // must be a plain object
    return 'object';
  };

  /*!
   * condense-newlines <https://github.com/jonschlinkert/condense-newlines>
   *
   * Copyright (c) 2014 Jon Schlinkert, contributors.
   * Licensed under the MIT License
   */

  var isWhitespace = isWhitespace$1;
  var extend$1 = extendShallow;
  var typeOf = kindOf;

  var condenseNewlines = function(str, options) {
    var opts = extend$1({}, options);
    var sep = opts.sep || '\n\n';
    var min = opts.min;
    var re;

    if (typeof min === 'number' && min !== 2) {
      re = new RegExp('(\\r\\n|\\n|\\u2424) {' + min + ',}');
    }
    if (typeof re === 'undefined') {
      re = opts.regex || /(\r\n|\n|\u2424){2,}/g;
    }

    // if a line is 100% whitespace it will be trimmed, so that
    // later we can condense newlines correctly
    if (opts.keepWhitespace !== true) {
      str = str.split('\n').map(function(line) {
        return isWhitespace(line) ? line.trim() : line;
      }).join('\n');
    }

    str = trailingNewline(str, opts);
    return str.replace(re, sep);
  };

  function trailingNewline(str, options) {
    var val = options.trailingNewline;
    if (val === false) {
      return str;
    }

    switch (typeOf(val)) {
      case 'string':
        str = str.replace(/\s+$/, options.trailingNewline);
        break;
      case 'function':
        str = options.trailingNewline(str);
        break;
      case 'undefined':
      case 'boolean':
      default: {
        str = str.replace(/\s+$/, '\n');
        break;
      }
    }
    return str;
  }

  /*!
   * pretty <https://github.com/jonschlinkert/pretty>
   *
   * Copyright (c) 2013-2015, 2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  var beautify = jsExports;
  var condense = condenseNewlines;
  var extend = extendShallow;
  var defaults = {
    unformatted: ['code', 'pre', 'em', 'strong', 'span'],
    indent_inner_html: true,
    indent_char: ' ',
    indent_size: 2,
    sep: '\n'
  };

  var pretty = function pretty(str, options) {
    var opts = extend({}, defaults, options);
    str = beautify.html(str, opts);

    if (opts.ocd === true) {
      if (opts.newlines) opts.sep = opts.newlines;
      return ocd(str, opts);
    }

    return str;
  };

  function ocd(str, options) {
    // Normalize and condense all newlines
    return condense(str, options)
      // Remove empty whitespace the top of a file.
      .replace(/^\s+/g, '')
      // Remove extra whitespace from eof
      .replace(/\s+$/g, '\n')

      // Add a space above each comment
      .replace(/(\s*<!--)/g, '\n$1')
      // Bring closing comments up to the same line as closing tag.
      .replace(/>(\s*)(?=<!--\s*\/)/g, '> ');
  }

  var pretty$1 = /*@__PURE__*/getDefaultExportFromCjs(pretty);

  // 


  function getSelectorType(selector) {
    if (isDomSelector(selector)) return DOM_SELECTOR
    if (isVueComponent(selector)) return COMPONENT_SELECTOR
    if (isNameSelector(selector)) return NAME_SELECTOR
    if (isRefSelector(selector)) return REF_SELECTOR

    return INVALID_SELECTOR
  }

  function getSelector(
    selector,
    methodName
  ) {
    const type = getSelectorType(selector);
    if (type === INVALID_SELECTOR) {
      throwError(
        `wrapper.${methodName}() must be passed a valid CSS selector, Vue ` +
          `constructor, or valid find option object`
      );
    }
    return {
      type,
      value: selector
    }
  }

  // 


  class WrapperArray   {
    
    
    

    constructor(wrappers) {
      const length = wrappers.length;
      // $FlowIgnore
      Object.defineProperty(this, 'wrappers', {
        get: () => wrappers,
        set: () => throwError('wrapperArray.wrappers is read-only')
      });
      // $FlowIgnore
      Object.defineProperty(this, 'length', {
        get: () => length,
        set: () => throwError('wrapperArray.length is read-only')
      });
    }

    at(index) {
      const normalizedIndex = index < 0 ? this.length + index : index;
      if (normalizedIndex > this.length - 1 || normalizedIndex < 0) {
        let error = `no item exists at ${index}`;
        error += index < 0 ? ` (normalized to ${normalizedIndex})` : '';
        throwError(error);
      }
      return this.wrappers[normalizedIndex]
    }

    attributes() {
      this.throwErrorIfWrappersIsEmpty('attributes');

      throwError(
        `attributes must be called on a single wrapper, use ` +
          `at(i) to access a wrapper`
      );
    }

    classes() {
      this.throwErrorIfWrappersIsEmpty('classes');

      throwError(
        `classes must be called on a single wrapper, use ` +
          `at(i) to access a wrapper`
      );
    }

    contains(selector) {
      this.throwErrorIfWrappersIsEmpty('contains');

      return this.wrappers.every(wrapper => wrapper.contains(selector))
    }

    exists() {
      return this.length > 0 && this.wrappers.every(wrapper => wrapper.exists())
    }

    filter(predicate) {
      return new WrapperArray(this.wrappers.filter(predicate))
    }

    emitted() {
      this.throwErrorIfWrappersIsEmpty('emitted');

      throwError(
        `emitted must be called on a single wrapper, use ` +
          `at(i) to access a wrapper`
      );
    }

    emittedByOrder() {
      this.throwErrorIfWrappersIsEmpty('emittedByOrder');

      throwError(
        `emittedByOrder must be called on a single wrapper, ` +
          `use at(i) to access a wrapper`
      );
    }

    findAll() {
      this.throwErrorIfWrappersIsEmpty('findAll');

      throwError(
        `findAll must be called on a single wrapper, use ` +
          `at(i) to access a wrapper`
      );
    }

    find() {
      this.throwErrorIfWrappersIsEmpty('find');

      throwError(
        `find must be called on a single wrapper, use at(i) ` +
          `to access a wrapper`
      );
    }

    html() {
      this.throwErrorIfWrappersIsEmpty('html');

      throwError(
        `html must be called on a single wrapper, use at(i) ` +
          `to access a wrapper`
      );
    }

    is(selector) {
      this.throwErrorIfWrappersIsEmpty('is');

      return this.wrappers.every(wrapper => wrapper.is(selector))
    }

    isEmpty() {
      this.throwErrorIfWrappersIsEmpty('isEmpty');

      return this.wrappers.every(wrapper => wrapper.isEmpty())
    }

    isVisible() {
      this.throwErrorIfWrappersIsEmpty('isVisible');

      return this.wrappers.every(wrapper => wrapper.isVisible())
    }

    isVueInstance() {
      this.throwErrorIfWrappersIsEmpty('isVueInstance');

      return this.wrappers.every(wrapper => wrapper.isVueInstance())
    }

    name() {
      this.throwErrorIfWrappersIsEmpty('name');

      throwError(
        `name must be called on a single wrapper, use at(i) ` +
          `to access a wrapper`
      );
    }

    overview() {
      this.throwErrorIfWrappersIsEmpty('overview()');

      throwError(
        `overview() must be called on a single wrapper, use at(i) ` +
          `to access a wrapper`
      );
    }

    props() {
      this.throwErrorIfWrappersIsEmpty('props');

      throwError(
        `props must be called on a single wrapper, use ` +
          `at(i) to access a wrapper`
      );
    }

    text() {
      this.throwErrorIfWrappersIsEmpty('text');

      throwError(
        `text must be called on a single wrapper, use at(i) ` +
          `to access a wrapper`
      );
    }

    throwErrorIfWrappersIsEmpty(method) {
      if (this.wrappers.length === 0) {
        throwError(`${method} cannot be called on 0 items`);
      }
    }

    setData(data) {
      this.throwErrorIfWrappersIsEmpty('setData');

      return Promise.all(this.wrappers.map(wrapper => wrapper.setData(data)))
    }

    setMethods(props) {
      this.throwErrorIfWrappersIsEmpty('setMethods');

      this.wrappers.forEach(wrapper => wrapper.setMethods(props));
    }

    setProps(props) {
      this.throwErrorIfWrappersIsEmpty('setProps');

      return Promise.all(this.wrappers.map(wrapper => wrapper.setProps(props)))
    }

    setValue(value) {
      this.throwErrorIfWrappersIsEmpty('setValue');

      return Promise.all(this.wrappers.map(wrapper => wrapper.setValue(value)))
    }

    setChecked(checked = true) {
      this.throwErrorIfWrappersIsEmpty('setChecked');

      return Promise.all(
        this.wrappers.map(wrapper => wrapper.setChecked(checked))
      )
    }

    setSelected() {
      this.throwErrorIfWrappersIsEmpty('setSelected');

      throwError(
        `setSelected must be called on a single wrapper, ` +
          `use at(i) to access a wrapper`
      );
    }

    trigger(event, options) {
      this.throwErrorIfWrappersIsEmpty('trigger');

      return Promise.all(
        this.wrappers.map(wrapper => wrapper.trigger(event, options))
      )
    }

    destroy() {
      this.throwErrorIfWrappersIsEmpty('destroy');

      this.wrappers.forEach(wrapper => wrapper.destroy());
    }
  }

  // 


  const buildSelectorString = (selector) => {
    if (getSelectorType(selector) === REF_SELECTOR) {
      return `ref="${selector.value.ref}"`
    }

    if (typeof selector === 'string') {
      return selector
    }

    return 'Component'
  };

  class ErrorWrapper   {
    

    constructor(selector) {
      this.selector = selector;
    }

    at() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call at() on empty Wrapper`
      );
    }

    attributes() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call attributes() on empty Wrapper`
      );
    }

    classes() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call classes() on empty Wrapper`
      );
    }

    contains() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call contains() on empty Wrapper`
      );
    }

    emitted() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call emitted() on empty Wrapper`
      );
    }

    emittedByOrder() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call emittedByOrder() on empty Wrapper`
      );
    }

    exists() {
      return false
    }

    filter() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call filter() on empty Wrapper`
      );
    }

    visible() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call visible() on empty Wrapper`
      );
    }

    hasAttribute() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call hasAttribute() on empty Wrapper`
      );
    }

    hasClass() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call hasClass() on empty Wrapper`
      );
    }

    hasProp() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call hasProp() on empty Wrapper`
      );
    }

    hasStyle() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call hasStyle() on empty Wrapper`
      );
    }

    findAll() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call findAll() on empty Wrapper`
      );
    }

    find() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call find() on empty Wrapper`
      );
    }

    html() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call html() on empty Wrapper`
      );
    }

    is() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call is() on empty Wrapper`
      );
    }

    isEmpty() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call isEmpty() on empty Wrapper`
      );
    }

    isVisible() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call isVisible() on empty Wrapper`
      );
    }

    isVueInstance() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call isVueInstance() on empty Wrapper`
      );
    }

    name() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call name() on empty Wrapper`
      );
    }

    overview() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call overview() on empty Wrapper`
      );
    }

    props() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call props() on empty Wrapper`
      );
    }

    text() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call text() on empty Wrapper`
      );
    }

    setComputed() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setComputed() on empty Wrapper`
      );
    }

    setData() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setData() on empty Wrapper`
      );
    }

    setMethods() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setMethods() on empty Wrapper`
      );
    }

    setProps() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setProps() on empty Wrapper`
      );
    }

    setValue() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setValue() on empty Wrapper`
      );
    }

    setChecked() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setChecked() on empty Wrapper`
      );
    }

    setSelected() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call setSelected() on empty Wrapper`
      );
    }

    trigger() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call trigger() on empty Wrapper`
      );
    }

    destroy() {
      throwError(
        `find did not return ${buildSelectorString(
        this.selector
      )}, cannot call destroy() on empty Wrapper`
      );
    }
  }

  /*!
   * isElementVisible
   * Ported from https://github.com/testing-library/jest-dom
   * Licensed under the MIT License.
   */

  function isStyleVisible(element) {
    if (
      !(element instanceof window.HTMLElement) &&
      !(element instanceof window.SVGElement)
    ) {
      return false
    }

    // Per https://lists.w3.org/Archives/Public/www-style/2018May/0031.html
    // getComputedStyle should only work with connected elements.
    const { display, visibility, opacity } = element.isConnected
      ? getComputedStyle(element)
      : element.style;
    return (
      display !== 'none' &&
      visibility !== 'hidden' &&
      visibility !== 'collapse' &&
      opacity !== '0' &&
      opacity !== 0
    )
  }

  function isAttributeVisible(element, previousElement) {
    return (
      !element.hasAttribute('hidden') &&
      (element.nodeName === 'DETAILS' && previousElement.nodeName !== 'SUMMARY'
        ? element.hasAttribute('open')
        : true)
    )
  }

  function isElementVisible(element, previousElement) {
    return (
      element.nodeName !== '#comment' &&
      isStyleVisible(element) &&
      isAttributeVisible(element, previousElement) &&
      (!element.parentElement || isElementVisible(element.parentElement, element))
    )
  }

  function recursivelySetData(vm, target, data) {
    keys$4(data).forEach(key => {
      const val = data[key];
      const targetVal = target[key];

      if (
        isPlainObject(val) &&
        isPlainObject(targetVal) &&
        keys$4(val).length > 0
      ) {
        recursivelySetData(vm, targetVal, val);
      } else {
        vm.$set(target, key, val);
      }
    });
  }

  var abort = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var afterprint = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var animationend = {
  	eventInterface: "AnimationEvent",
  	bubbles: true,
  	cancelable: false
  };
  var animationiteration = {
  	eventInterface: "AnimationEvent",
  	bubbles: true,
  	cancelable: false
  };
  var animationstart = {
  	eventInterface: "AnimationEvent",
  	bubbles: true,
  	cancelable: false
  };
  var appinstalled = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var audioprocess = {
  	eventInterface: "AudioProcessingEvent"
  };
  var audioend = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var audiostart = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var beforeprint = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var beforeunload = {
  	eventInterface: "BeforeUnloadEvent",
  	bubbles: false,
  	cancelable: true
  };
  var beginEvent = {
  	eventInterface: "TimeEvent",
  	bubbles: false,
  	cancelable: false
  };
  var blur = {
  	eventInterface: "FocusEvent",
  	bubbles: false,
  	cancelable: false
  };
  var boundary = {
  	eventInterface: "SpeechSynthesisEvent",
  	bubbles: false,
  	cancelable: false
  };
  var cached = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var canplay = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var canplaythrough = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var change = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var chargingchange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var chargingtimechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var checking = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var click = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var close = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var complete = {
  	eventInterface: "OfflineAudioCompletionEvent"
  };
  var compositionend = {
  	eventInterface: "CompositionEvent",
  	bubbles: true,
  	cancelable: true
  };
  var compositionstart = {
  	eventInterface: "CompositionEvent",
  	bubbles: true,
  	cancelable: true
  };
  var compositionupdate = {
  	eventInterface: "CompositionEvent",
  	bubbles: true,
  	cancelable: false
  };
  var contextmenu = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var copy = {
  	eventInterface: "ClipboardEvent"
  };
  var cut = {
  	eventInterface: "ClipboardEvent",
  	bubbles: true,
  	cancelable: true
  };
  var dblclick = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var devicechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var devicelight = {
  	eventInterface: "DeviceLightEvent",
  	bubbles: false,
  	cancelable: false
  };
  var devicemotion = {
  	eventInterface: "DeviceMotionEvent",
  	bubbles: false,
  	cancelable: false
  };
  var deviceorientation = {
  	eventInterface: "DeviceOrientationEvent",
  	bubbles: false,
  	cancelable: false
  };
  var deviceproximity = {
  	eventInterface: "DeviceProximityEvent",
  	bubbles: false,
  	cancelable: false
  };
  var dischargingtimechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var DOMActivate = {
  	eventInterface: "UIEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMAttributeNameChanged = {
  	eventInterface: "MutationNameEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMAttrModified = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMCharacterDataModified = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMContentLoaded = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: true
  };
  var DOMElementNameChanged = {
  	eventInterface: "MutationNameEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMFocusIn = {
  	eventInterface: "FocusEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMFocusOut = {
  	eventInterface: "FocusEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMNodeInserted = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMNodeInsertedIntoDocument = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMNodeRemoved = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMNodeRemovedFromDocument = {
  	eventInterface: "MutationEvent",
  	bubbles: true,
  	cancelable: true
  };
  var DOMSubtreeModified = {
  	eventInterface: "MutationEvent"
  };
  var downloading = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var drag = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: true
  };
  var dragend = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: false
  };
  var dragenter = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: true
  };
  var dragleave = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: false
  };
  var dragover = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: true
  };
  var dragstart = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: true
  };
  var drop = {
  	eventInterface: "DragEvent",
  	bubbles: true,
  	cancelable: true
  };
  var durationchange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var emptied = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var end = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var ended = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var endEvent = {
  	eventInterface: "TimeEvent",
  	bubbles: false,
  	cancelable: false
  };
  var error = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var focus = {
  	eventInterface: "FocusEvent",
  	bubbles: false,
  	cancelable: false
  };
  var focusin = {
  	eventInterface: "FocusEvent",
  	bubbles: true,
  	cancelable: false
  };
  var focusout = {
  	eventInterface: "FocusEvent",
  	bubbles: true,
  	cancelable: false
  };
  var fullscreenchange = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var fullscreenerror = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var gamepadconnected = {
  	eventInterface: "GamepadEvent",
  	bubbles: false,
  	cancelable: false
  };
  var gamepaddisconnected = {
  	eventInterface: "GamepadEvent",
  	bubbles: false,
  	cancelable: false
  };
  var gotpointercapture = {
  	eventInterface: "PointerEvent",
  	bubbles: false,
  	cancelable: false
  };
  var hashchange = {
  	eventInterface: "HashChangeEvent",
  	bubbles: true,
  	cancelable: false
  };
  var lostpointercapture = {
  	eventInterface: "PointerEvent",
  	bubbles: false,
  	cancelable: false
  };
  var input = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var invalid = {
  	eventInterface: "Event",
  	cancelable: true,
  	bubbles: false
  };
  var keydown = {
  	eventInterface: "KeyboardEvent",
  	bubbles: true,
  	cancelable: true
  };
  var keypress = {
  	eventInterface: "KeyboardEvent",
  	bubbles: true,
  	cancelable: true
  };
  var keyup = {
  	eventInterface: "KeyboardEvent",
  	bubbles: true,
  	cancelable: true
  };
  var languagechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var levelchange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var load = {
  	eventInterface: "UIEvent",
  	bubbles: false,
  	cancelable: false
  };
  var loadeddata = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var loadedmetadata = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var loadend = {
  	eventInterface: "ProgressEvent",
  	bubbles: false,
  	cancelable: false
  };
  var loadstart = {
  	eventInterface: "ProgressEvent",
  	bubbles: false,
  	cancelable: false
  };
  var mark = {
  	eventInterface: "SpeechSynthesisEvent",
  	bubbles: false,
  	cancelable: false
  };
  var message = {
  	eventInterface: "MessageEvent",
  	bubbles: false,
  	cancelable: false
  };
  var messageerror = {
  	eventInterface: "MessageEvent",
  	bubbles: false,
  	cancelable: false
  };
  var mousedown = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var mouseenter = {
  	eventInterface: "MouseEvent",
  	bubbles: false,
  	cancelable: false
  };
  var mouseleave = {
  	eventInterface: "MouseEvent",
  	bubbles: false,
  	cancelable: false
  };
  var mousemove = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var mouseout = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var mouseover = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var mouseup = {
  	eventInterface: "MouseEvent",
  	bubbles: true,
  	cancelable: true
  };
  var nomatch = {
  	eventInterface: "SpeechRecognitionEvent",
  	bubbles: false,
  	cancelable: false
  };
  var notificationclick = {
  	eventInterface: "NotificationEvent",
  	bubbles: false,
  	cancelable: false
  };
  var noupdate = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var obsolete = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var offline = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var online = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var open = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var orientationchange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var pagehide = {
  	eventInterface: "PageTransitionEvent",
  	bubbles: false,
  	cancelable: false
  };
  var pageshow = {
  	eventInterface: "PageTransitionEvent",
  	bubbles: false,
  	cancelable: false
  };
  var paste = {
  	eventInterface: "ClipboardEvent",
  	bubbles: true,
  	cancelable: true
  };
  var pause = {
  	eventInterface: "SpeechSynthesisEvent",
  	bubbles: false,
  	cancelable: false
  };
  var pointercancel = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: false
  };
  var pointerdown = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: true
  };
  var pointerenter = {
  	eventInterface: "PointerEvent",
  	bubbles: false,
  	cancelable: false
  };
  var pointerleave = {
  	eventInterface: "PointerEvent",
  	bubbles: false,
  	cancelable: false
  };
  var pointerlockchange = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var pointerlockerror = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var pointermove = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: true
  };
  var pointerout = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: true
  };
  var pointerover = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: true
  };
  var pointerup = {
  	eventInterface: "PointerEvent",
  	bubbles: true,
  	cancelable: true
  };
  var play = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var playing = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var popstate = {
  	eventInterface: "PopStateEvent",
  	bubbles: true,
  	cancelable: false
  };
  var progress = {
  	eventInterface: "ProgressEvent",
  	bubbles: false,
  	cancelable: false
  };
  var push = {
  	eventInterface: "PushEvent",
  	bubbles: false,
  	cancelable: false
  };
  var pushsubscriptionchange = {
  	eventInterface: "PushEvent",
  	bubbles: false,
  	cancelable: false
  };
  var ratechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var readystatechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var repeatEvent = {
  	eventInterface: "TimeEvent",
  	bubbles: false,
  	cancelable: false
  };
  var reset = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: true
  };
  var resize = {
  	eventInterface: "UIEvent",
  	bubbles: false,
  	cancelable: false
  };
  var resourcetimingbufferfull = {
  	eventInterface: "Performance",
  	bubbles: true,
  	cancelable: true
  };
  var result = {
  	eventInterface: "SpeechRecognitionEvent",
  	bubbles: false,
  	cancelable: false
  };
  var resume = {
  	eventInterface: "SpeechSynthesisEvent",
  	bubbles: false,
  	cancelable: false
  };
  var scroll = {
  	eventInterface: "UIEvent",
  	bubbles: false,
  	cancelable: false
  };
  var seeked = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var seeking = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var select = {
  	eventInterface: "UIEvent",
  	bubbles: true,
  	cancelable: false
  };
  var selectstart = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: true
  };
  var selectionchange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var show = {
  	eventInterface: "MouseEvent",
  	bubbles: false,
  	cancelable: false
  };
  var slotchange = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var soundend = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var soundstart = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var speechend = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var speechstart = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var stalled = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var start = {
  	eventInterface: "SpeechSynthesisEvent",
  	bubbles: false,
  	cancelable: false
  };
  var storage = {
  	eventInterface: "StorageEvent",
  	bubbles: false,
  	cancelable: false
  };
  var submit = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: true
  };
  var success = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var suspend = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var SVGAbort = {
  	eventInterface: "SVGEvent",
  	bubbles: true,
  	cancelable: false
  };
  var SVGError = {
  	eventInterface: "SVGEvent",
  	bubbles: true,
  	cancelable: false
  };
  var SVGLoad = {
  	eventInterface: "SVGEvent",
  	bubbles: false,
  	cancelable: false
  };
  var SVGResize = {
  	eventInterface: "SVGEvent",
  	bubbles: true,
  	cancelable: false
  };
  var SVGScroll = {
  	eventInterface: "SVGEvent",
  	bubbles: true,
  	cancelable: false
  };
  var SVGUnload = {
  	eventInterface: "SVGEvent",
  	bubbles: false,
  	cancelable: false
  };
  var SVGZoom = {
  	eventInterface: "SVGZoomEvent",
  	bubbles: true,
  	cancelable: false
  };
  var timeout = {
  	eventInterface: "ProgressEvent",
  	bubbles: false,
  	cancelable: false
  };
  var timeupdate = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var touchcancel = {
  	eventInterface: "TouchEvent",
  	bubbles: true,
  	cancelable: false
  };
  var touchend = {
  	eventInterface: "TouchEvent",
  	bubbles: true,
  	cancelable: true
  };
  var touchmove = {
  	eventInterface: "TouchEvent",
  	bubbles: true,
  	cancelable: true
  };
  var touchstart = {
  	eventInterface: "TouchEvent",
  	bubbles: true,
  	cancelable: true
  };
  var transitionend = {
  	eventInterface: "TransitionEvent",
  	bubbles: true,
  	cancelable: true
  };
  var unload = {
  	eventInterface: "UIEvent",
  	bubbles: false
  };
  var updateready = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var userproximity = {
  	eventInterface: "UserProximityEvent",
  	bubbles: false,
  	cancelable: false
  };
  var voiceschanged = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var visibilitychange = {
  	eventInterface: "Event",
  	bubbles: true,
  	cancelable: false
  };
  var volumechange = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var waiting = {
  	eventInterface: "Event",
  	bubbles: false,
  	cancelable: false
  };
  var wheel = {
  	eventInterface: "WheelEvent",
  	bubbles: true,
  	cancelable: true
  };
  var require$$0 = {
  	abort: abort,
  	afterprint: afterprint,
  	animationend: animationend,
  	animationiteration: animationiteration,
  	animationstart: animationstart,
  	appinstalled: appinstalled,
  	audioprocess: audioprocess,
  	audioend: audioend,
  	audiostart: audiostart,
  	beforeprint: beforeprint,
  	beforeunload: beforeunload,
  	beginEvent: beginEvent,
  	blur: blur,
  	boundary: boundary,
  	cached: cached,
  	canplay: canplay,
  	canplaythrough: canplaythrough,
  	change: change,
  	chargingchange: chargingchange,
  	chargingtimechange: chargingtimechange,
  	checking: checking,
  	click: click,
  	close: close,
  	complete: complete,
  	compositionend: compositionend,
  	compositionstart: compositionstart,
  	compositionupdate: compositionupdate,
  	contextmenu: contextmenu,
  	copy: copy,
  	cut: cut,
  	dblclick: dblclick,
  	devicechange: devicechange,
  	devicelight: devicelight,
  	devicemotion: devicemotion,
  	deviceorientation: deviceorientation,
  	deviceproximity: deviceproximity,
  	dischargingtimechange: dischargingtimechange,
  	DOMActivate: DOMActivate,
  	DOMAttributeNameChanged: DOMAttributeNameChanged,
  	DOMAttrModified: DOMAttrModified,
  	DOMCharacterDataModified: DOMCharacterDataModified,
  	DOMContentLoaded: DOMContentLoaded,
  	DOMElementNameChanged: DOMElementNameChanged,
  	DOMFocusIn: DOMFocusIn,
  	DOMFocusOut: DOMFocusOut,
  	DOMNodeInserted: DOMNodeInserted,
  	DOMNodeInsertedIntoDocument: DOMNodeInsertedIntoDocument,
  	DOMNodeRemoved: DOMNodeRemoved,
  	DOMNodeRemovedFromDocument: DOMNodeRemovedFromDocument,
  	DOMSubtreeModified: DOMSubtreeModified,
  	downloading: downloading,
  	drag: drag,
  	dragend: dragend,
  	dragenter: dragenter,
  	dragleave: dragleave,
  	dragover: dragover,
  	dragstart: dragstart,
  	drop: drop,
  	durationchange: durationchange,
  	emptied: emptied,
  	end: end,
  	ended: ended,
  	endEvent: endEvent,
  	error: error,
  	focus: focus,
  	focusin: focusin,
  	focusout: focusout,
  	fullscreenchange: fullscreenchange,
  	fullscreenerror: fullscreenerror,
  	gamepadconnected: gamepadconnected,
  	gamepaddisconnected: gamepaddisconnected,
  	gotpointercapture: gotpointercapture,
  	hashchange: hashchange,
  	lostpointercapture: lostpointercapture,
  	input: input,
  	invalid: invalid,
  	keydown: keydown,
  	keypress: keypress,
  	keyup: keyup,
  	languagechange: languagechange,
  	levelchange: levelchange,
  	load: load,
  	loadeddata: loadeddata,
  	loadedmetadata: loadedmetadata,
  	loadend: loadend,
  	loadstart: loadstart,
  	mark: mark,
  	message: message,
  	messageerror: messageerror,
  	mousedown: mousedown,
  	mouseenter: mouseenter,
  	mouseleave: mouseleave,
  	mousemove: mousemove,
  	mouseout: mouseout,
  	mouseover: mouseover,
  	mouseup: mouseup,
  	nomatch: nomatch,
  	notificationclick: notificationclick,
  	noupdate: noupdate,
  	obsolete: obsolete,
  	offline: offline,
  	online: online,
  	open: open,
  	orientationchange: orientationchange,
  	pagehide: pagehide,
  	pageshow: pageshow,
  	paste: paste,
  	pause: pause,
  	pointercancel: pointercancel,
  	pointerdown: pointerdown,
  	pointerenter: pointerenter,
  	pointerleave: pointerleave,
  	pointerlockchange: pointerlockchange,
  	pointerlockerror: pointerlockerror,
  	pointermove: pointermove,
  	pointerout: pointerout,
  	pointerover: pointerover,
  	pointerup: pointerup,
  	play: play,
  	playing: playing,
  	popstate: popstate,
  	progress: progress,
  	push: push,
  	pushsubscriptionchange: pushsubscriptionchange,
  	ratechange: ratechange,
  	readystatechange: readystatechange,
  	repeatEvent: repeatEvent,
  	reset: reset,
  	resize: resize,
  	resourcetimingbufferfull: resourcetimingbufferfull,
  	result: result,
  	resume: resume,
  	scroll: scroll,
  	seeked: seeked,
  	seeking: seeking,
  	select: select,
  	selectstart: selectstart,
  	selectionchange: selectionchange,
  	show: show,
  	slotchange: slotchange,
  	soundend: soundend,
  	soundstart: soundstart,
  	speechend: speechend,
  	speechstart: speechstart,
  	stalled: stalled,
  	start: start,
  	storage: storage,
  	submit: submit,
  	success: success,
  	suspend: suspend,
  	SVGAbort: SVGAbort,
  	SVGError: SVGError,
  	SVGLoad: SVGLoad,
  	SVGResize: SVGResize,
  	SVGScroll: SVGScroll,
  	SVGUnload: SVGUnload,
  	SVGZoom: SVGZoom,
  	timeout: timeout,
  	timeupdate: timeupdate,
  	touchcancel: touchcancel,
  	touchend: touchend,
  	touchmove: touchmove,
  	touchstart: touchstart,
  	transitionend: transitionend,
  	unload: unload,
  	updateready: updateready,
  	userproximity: userproximity,
  	voiceschanged: voiceschanged,
  	visibilitychange: visibilitychange,
  	volumechange: volumechange,
  	waiting: waiting,
  	wheel: wheel
  };

  var domEventTypes = require$$0;

  var eventTypes$1 = /*@__PURE__*/getDefaultExportFromCjs(domEventTypes);

  const defaultEventType = {
    eventInterface: 'Event',
    cancelable: true,
    bubbles: true
  };

  const modifiers = {
    enter: 13,
    tab: 9,
    delete: 46,
    esc: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    end: 35,
    home: 36,
    backspace: 8,
    insert: 45,
    pageup: 33,
    pagedown: 34
  };

  // get from https://github.com/ashubham/w3c-keys/blob/master/index.ts
  const w3cKeys = {
    enter: 'Enter',
    tab: 'Tab',
    delete: 'Delete',
    esc: 'Esc',
    escape: 'Escape',
    space: ' ',
    up: 'ArrowUp',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    down: 'ArrowDown',
    end: 'End',
    home: 'Home',
    backspace: 'Backspace',
    insert: 'Insert',
    pageup: 'PageUp',
    pagedown: 'PageDown'
  };

  const codeToKeyNameMap = Object.entries(modifiers).reduce(
    (acc, [key, value]) => Object.assign(acc, { [value]: w3cKeys[key] }),
    {}
  );

  function getOptions(eventParams) {
    const { modifier, meta, options } = eventParams;
    const keyCode = modifiers[modifier] || options.keyCode || options.code;
    const key = codeToKeyNameMap[keyCode];

    return {
      ...options, // What the user passed in as the second argument to #trigger

      bubbles: meta.bubbles,
      cancelable: meta.cancelable,

      // Any derived options should go here
      keyCode,
      code: keyCode,
      key: key || options.key
    }
  }

  function createEvent(eventParams) {
    const { eventType, meta = {} } = eventParams;

    const SupportedEventInterface =
      typeof window[meta.eventInterface] === 'function'
        ? window[meta.eventInterface]
        : window.Event;

    const event = new SupportedEventInterface(
      eventType,
      // event properties can only be added when the event is instantiated
      // custom properties must be added after the event has been instantiated
      getOptions(eventParams)
    );

    return event
  }

  function createOldEvent(eventParams) {
    const { eventType, modifier, meta } = eventParams;
    const { bubbles, cancelable } = meta;

    const event = document.createEvent('Event');
    event.initEvent(eventType, bubbles, cancelable);
    event.keyCode = modifiers[modifier];
    return event
  }

  function createDOMEvent(type, options) {
    const [eventType, modifier] = type.split('.');
    const meta = eventTypes$1[eventType] || defaultEventType;

    const eventParams = { eventType, modifier, meta, options };

    // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
    const event =
      typeof window.Event === 'function'
        ? createEvent(eventParams)
        : createOldEvent(eventParams);

    const eventPrototype = Object.getPrototypeOf(event);
    keys$4(options || {}).forEach(key => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        eventPrototype,
        key
      );

      const canSetProperty = !(
        propertyDescriptor && propertyDescriptor.setter === undefined
      );
      if (canSetProperty) {
        event[key] = options[key];
      }
    });

    return event
  }

  // 


  class Wrapper   {
    
    
    
    
    
    
    
    
    

    constructor(
      node,
      options,
      isVueWrapper
    ) {
      const vnode = node instanceof Element ? null : node;
      const element = node instanceof Element ? node : node.elm;
      // Prevent redefine by VueWrapper
      if (!isVueWrapper) {
        // $FlowIgnore : issue with defineProperty
        Object.defineProperty(this, 'rootNode', {
          get: () => vnode || element,
          set: () => throwError('wrapper.rootNode is read-only')
        });
        // $FlowIgnore
        Object.defineProperty(this, 'vnode', {
          get: () => vnode,
          set: () => throwError('wrapper.vnode is read-only')
        });
        // $FlowIgnore
        Object.defineProperty(this, 'element', {
          get: () => element,
          set: () => throwError('wrapper.element is read-only')
        });
        // $FlowIgnore
        Object.defineProperty(this, 'vm', {
          get: () => undefined,
          set: () => throwError('wrapper.vm is read-only')
        });
      }
      const frozenOptions = Object.freeze(options);
      // $FlowIgnore
      Object.defineProperty(this, 'options', {
        get: () => frozenOptions,
        set: () => throwError('wrapper.options is read-only')
      });
      if (
        this.vnode &&
        (this.vnode[FUNCTIONAL_OPTIONS] || this.vnode.functionalContext)
      ) {
        this.isFunctionalComponent = true;
      }
    }

    /**
     * Prints warning if component is destroyed
     */
    __warnIfDestroyed() {
      if (!this.exists()) {
        warn('Operations on destroyed component are discouraged');
      }
    }

    at() {
      this.__warnIfDestroyed();

      throwError('at() must be called on a WrapperArray');
    }

    /**
     * Returns an Object containing all the attribute/value pairs on the element.
     */
    attributes(key) {
      this.__warnIfDestroyed();

      const attributes = this.element.attributes;
      const attributeMap = {};
      for (let i = 0; i < attributes.length; i++) {
        const att = attributes.item(i);
        attributeMap[att.localName] = att.value;
      }

      return key ? attributeMap[key] : attributeMap
    }

    getAttribute(attrName) {
      if (!attrName) {
        throwError('getAttributes() attrName must be defined! Value was: ' + attrName);
      }

      return this.element.getAttribute(attrName)
    }

    /**
     * Returns an Array containing all the classes on the element
     */
    classes(className) {
      this.__warnIfDestroyed();

      const classAttribute = this.element.getAttribute('class');
      let classes = classAttribute ? classAttribute.split(' ') : [];
      // Handle converting cssmodules identifiers back to the original class name
      if (this.vm && this.vm.$style) {
        const cssModuleIdentifiers = keys$4(this.vm.$style).reduce((acc, key) => {
          // $FlowIgnore
          const moduleIdent = this.vm.$style[key];
          if (moduleIdent) {
            acc[moduleIdent.split(' ')[0]] = key;
          }
          return acc
        }, {});
        classes = classes.map(name => cssModuleIdentifiers[name] || name);
      }

      return className ? !!(classes.indexOf(className) > -1) : classes
    }

    /**
     * Checks if wrapper contains provided selector.
     * @deprecated
     */
    contains(rawSelector) {
      warnDeprecated(
        'contains',
        'Use `wrapper.find`, `wrapper.findComponent` or `wrapper.get` instead'
      );

      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'contains');
      const nodes = find(this.rootNode, this.vm, selector);
      return nodes.length > 0
    }

    /**
     * Calls destroy on vm
     */
    destroy() {
      if (!this.vm && !this.isFunctionalComponent) {
        throwError(
          `wrapper.destroy() can only be called on a Vue instance or ` +
            `functional component.`
        );
      }

      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      if (this.vm) {
        // $FlowIgnore
        this.vm.$destroy();
        throwIfInstancesThrew(this.vm);
      }
    }

    /**
     * Returns an object containing custom events emitted by the Wrapper vm
     */
    emitted(
      event
    ) {
      if (!this._emitted && !this.vm) {
        throwError(`wrapper.emitted() can only be called on a Vue instance`);
      }
      if (event) {
        return this._emitted[event]
      }
      return this._emitted
    }

    /**
     * Returns an Array containing custom events emitted by the Wrapper vm
     * @deprecated
     */
    emittedByOrder() {
      warnDeprecated('emittedByOrder', 'Use `wrapper.emitted` instead');
      if (!this._emittedByOrder && !this.vm) {
        throwError(
          `wrapper.emittedByOrder() can only be called on a Vue instance`
        );
      }
      return this._emittedByOrder
    }

    /**
     * Utility to check wrapper exists.
     */
    exists() {
      if (this.vm) {
        return !!this.vm && !this.vm._isDestroyed
      }
      return true
    }

    filter() {
      throwError('filter() must be called on a WrapperArray');
    }

    /**
     * Gets first node in tree of the current wrapper that
     * matches the provided selector.
     */
    get(rawSelector) {
      this.__warnIfDestroyed();

      const found = this.find(rawSelector);
      if (found instanceof ErrorWrapper) {
        throw new Error(`Unable to find ${rawSelector} within: ${this.html()}`)
      }
      return found
    }

    /**
     * Gets first node in tree of the current wrapper that
     * matches the provided selector.
     */
    getComponent(rawSelector) {
      this.__warnIfDestroyed();

      const found = this.findComponent(rawSelector);
      if (found instanceof ErrorWrapper) {
        throw new Error(`Unable to get ${rawSelector} within: ${this.html()}`)
      }
      return found
    }

    /**
     * Finds first DOM node in tree of the current wrapper that
     * matches the provided selector.
     */
    find(rawSelector) {
      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'find');
      if (selector.type !== DOM_SELECTOR) {
        warnDeprecated(
          'finding components with `find` or `get`',
          'Use `findComponent` and `getComponent` instead'
        );
      }

      return this.__find(rawSelector, selector)
    }

    /**
     * Finds first component in tree of the current wrapper that
     * matches the provided selector.
     */
    findComponent(rawSelector) {
      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'findComponent');

      return this.__find(rawSelector, selector)
    }

    __find(rawSelector, selector) {
      const node = find(this.rootNode, this.vm, selector)[0];

      if (!node) {
        return new ErrorWrapper(rawSelector)
      }

      const wrapper = createWrapper(node, this.options);
      wrapper.selector = rawSelector;
      return wrapper
    }

    /**
     * Finds DOM elements in tree of the current wrapper that matches
     * the provided selector.
     */
    findAll(rawSelector) {
      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'findAll');
      if (selector.type !== DOM_SELECTOR) {
        warnDeprecated(
          'finding components with `findAll`',
          'Use `findAllComponents` instead'
        );
      }
      return this.__findAll(rawSelector, selector)
    }

    /**
     * Finds components in tree of the current wrapper that matches
     * the provided selector.
     */
    findAllComponents(rawSelector) {
      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'findAll');

      return this.__findAll(rawSelector, selector, isVueWrapper)
    }

    __findAll(
      rawSelector,
      selector,
      filterFn = () => true
    ) {
      const nodes = find(this.rootNode, this.vm, selector);
      const wrappers = nodes
        .map(node => {
          // Using CSS Selector, returns a VueWrapper instance if the root element
          // binds a Vue instance.
          const wrapper = createWrapper(node, this.options);
          wrapper.selector = rawSelector;
          return wrapper
        })
        .filter(filterFn);

      const wrapperArray = new WrapperArray(wrappers);
      wrapperArray.selector = rawSelector;
      return wrapperArray
    }

    /**
     * Returns HTML of element as a string
     */
    html() {
      this.__warnIfDestroyed();

      return pretty$1(this.element.outerHTML)
    }

    /**
     * Checks if node matches selector or component definition
     */
    is(rawSelector) {
      this.__warnIfDestroyed();

      const selector = getSelector(rawSelector, 'is');

      if (selector.type === DOM_SELECTOR) {
        warnDeprecated(
          'checking tag name with `is`',
          'Use `element.tagName` instead'
        );
      }

      if (selector.type === REF_SELECTOR) {
        throwError('$ref selectors can not be used with wrapper.is()');
      }

      return matches(this.rootNode, selector)
    }

    /**
     * Checks if node is empty
     * @deprecated
     */
    isEmpty() {
      warnDeprecated(
        'isEmpty',
        'Consider a custom matcher such as those provided in jest-dom: https://github.com/testing-library/jest-dom#tobeempty. ' +
          'When using with findComponent, access the DOM element with findComponent(Comp).element'
      );
      this.__warnIfDestroyed();

      if (!this.vnode) {
        return this.element.innerHTML === ''
      }
      const nodes = [];
      let node = this.vnode;
      let i = 0;

      while (node) {
        if (node.child) {
          nodes.push(node.child._vnode);
        }
        node.children &&
          node.children.forEach(n => {
            nodes.push(n);
          });
        node = nodes[i++];
      }
      return nodes.every(n => n.isComment || n.child)
    }

    /**
     * Checks if node is visible
     */
    isVisible() {
      this.__warnIfDestroyed();

      return isElementVisible(this.element)
    }

    /**
     * Checks if wrapper is a vue instance
     * @deprecated
     */
    isVueInstance() {
      warnDeprecated(`isVueInstance`);
      this.__warnIfDestroyed();

      return !!this.vm
    }

    /**
     * Returns name of component, or tag name if node is not a Vue component
     * @deprecated
     */
    name() {
      warnDeprecated(`name`);
      this.__warnIfDestroyed();

      if (this.vm) {
        return (
          this.vm.$options.name ||
          // compat for Vue < 2.3
          (this.vm.$options.extendOptions && this.vm.$options.extendOptions.name)
        )
      }

      if (!this.vnode) {
        return this.element.tagName
      }

      return this.vnode.tag
    }

    /**
     * Prints a simple overview of the wrapper current state
     * with useful information for debugging
     * @deprecated
     */
    overview() {
      warnDeprecated(`overview`);
      this.__warnIfDestroyed();

      if (!this.vm) {
        throwError(`wrapper.overview() can only be called on a Vue instance`);
      }

      const identation = 4;
      const formatJSON = (json, replacer = null) =>
        JSON.stringify(json, replacer, identation).replace(/"/g, '');

      const visibility = this.isVisible() ? 'Visible' : 'Not visible';

      const html = this.html()
        ? this.html().replace(/^(?!\s*$)/gm, ' '.repeat(identation)) + '\n'
        : '';

      // $FlowIgnore
      const data = formatJSON(this.vm.$data);

      /* eslint-disable operator-linebreak */
      // $FlowIgnore
      const computed = this.vm._computedWatchers
        ? formatJSON(
            // $FlowIgnore
            ...keys$4(this.vm._computedWatchers).map(computedKey => ({
              // $FlowIgnore
              [computedKey]: this.vm[computedKey]
            }))
          )
        : // $FlowIgnore
        this.vm.$options.computed
        ? formatJSON(
            // $FlowIgnore
            ...Object.entries(this.vm.$options.computed).map(([key, value]) => ({
              // $FlowIgnore
              [key]: value()
            }))
          )
        : '{}';
      /* eslint-enable operator-linebreak */

      const emittedJSONReplacer = (key, value) =>
        value instanceof Array
          ? value.map((calledWith, index) => {
              const callParams = calledWith.map(param =>
                typeof param === 'object'
                  ? JSON.stringify(param).replace(/"/g, '').replace(/,/g, ', ')
                  : param
              );

              return `${index}: [ ${callParams.join(', ')} ]`
            })
          : value;

      const emitted = formatJSON(this.emitted(), emittedJSONReplacer);

      console.log(
        '\n' +
          `Wrapper (${visibility}):\n\n` +
          `Html:\n${html}\n` +
          `Data: ${data}\n\n` +
          `Computed: ${computed}\n\n` +
          `Emitted: ${emitted}\n`
      );
    }

    /**
     * Returns an Object containing the prop name/value pairs on the element
     */
    props(key) {
      if (this.isFunctionalComponent) {
        throwError(
          `wrapper.props() cannot be called on a mounted functional component.`
        );
      }
      if (!this.vm) {
        throwError('wrapper.props() must be called on a Vue instance');
      }
      this.__warnIfDestroyed();

      const props = {};
      const keys = this.vm && this.vm.$options._propKeys;

      if (keys) {
  (keys || {}).forEach(key => {
          if (this.vm) {
            props[key] = this.vm[key];
          }
        });
      }

      if (key) {
        return props[key]
      }

      return props
    }

    /**
     * Checks radio button or checkbox element
     * @deprecated
     */
    setChecked(checked = true) {
      this.__warnIfDestroyed();

      if (typeof checked !== 'boolean') {
        throwError('wrapper.setChecked() must be passed a boolean');
      }
      const tagName = this.element.tagName;
      // $FlowIgnore
      const type = this.getAttribute('type');
      const event = getCheckedEvent();

      if (tagName === 'INPUT' && type === 'checkbox') {
        // $FlowIgnore
        if (this.element.checked === checked) {
          return nextTick()
        }
        if (event !== 'click' || isPhantomJS) {
          // $FlowIgnore
          this.element.checked = checked;
        }
        return this.trigger(event)
      }

      if (tagName === 'INPUT' && type === 'radio') {
        if (!checked) {
          throwError(
            `wrapper.setChecked() cannot be called with parameter false on a ` +
              `<input type="radio" /> element.`
          );
        }

        // $FlowIgnore
        if (this.element.checked === checked) {
          return nextTick()
        }

        if (event !== 'click' || isPhantomJS) {
          // $FlowIgnore
          this.element.selected = true;
        }
        return this.trigger(event)
      }

      throwError(`wrapper.setChecked() cannot be called on this element`);
      return nextTick()
    }

    /**
     * Selects <option></option> element
     * @deprecated
     */
    setSelected() {
      this.__warnIfDestroyed();

      const tagName = this.element.tagName;

      if (tagName === 'SELECT') {
        throwError(
          `wrapper.setSelected() cannot be called on select. Call it on one of ` +
            `its options`
        );
      }

      if (tagName !== 'OPTION') {
        throwError(`wrapper.setSelected() cannot be called on this element`);
      }

      // $FlowIgnore
      if (this.element.selected) {
        return nextTick()
      }

      // $FlowIgnore
      this.element.selected = true;
      // $FlowIgnore
      let parentElement = this.element.parentElement;

      // $FlowIgnore
      if (parentElement.tagName === 'OPTGROUP') {
        // $FlowIgnore
        parentElement = parentElement.parentElement;
      }

      // $FlowIgnore
      return createWrapper(parentElement, this.options).trigger('change')
    }

    /**
     * Sets vm data
     */
    setData(data) {
      if (this.isFunctionalComponent) {
        throwError(`wrapper.setData() cannot be called on a functional component`);
      }

      if (!this.vm) {
        throwError(`wrapper.setData() can only be called on a Vue instance`);
      }

      this.__warnIfDestroyed();

      recursivelySetData(this.vm, this.vm, data);
      return nextTick()
    }

    /**
     * Sets vm methods
     * @deprecated
     */
    setMethods(methods) {
      warnDeprecated(
        `setMethods`,
        `There is no clear migration path for setMethods - Vue does not support arbitrarily replacement of methods, nor should VTU. To stub a complex method extract it from the component and test it in isolation. Otherwise, the suggestion is to rethink those tests`
      );

      if (!this.vm) {
        throwError(`wrapper.setMethods() can only be called on a Vue instance`);
      }
      this.__warnIfDestroyed();

      keys$4(methods).forEach(key => {
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm[key] = methods[key];
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm.$options.methods[key] = methods[key];
      });

      if (this.vnode) {
        const context = this.vnode.context;
        if (context.$options.render) context._update(context._render());
      }
    }

    /**
     * Sets vm props
     */
    setProps(data) {
      // Validate the setProps method call
      if (this.isFunctionalComponent) {
        throwError(
          `wrapper.setProps() cannot be called on a functional component`
        );
      }

      if (!this.vm) {
        throwError(`wrapper.setProps() can only be called on a Vue instance`);
      }

      // $FlowIgnore : Problem with possibly null this.vm
      if (!this.vm.$parent.$options.$_isWrapperParent) {
        throwError(
          `wrapper.setProps() can only be called for top-level component`
        );
      }

      this.__warnIfDestroyed();

      keys$4(data).forEach(key => {
        // Don't let people set entire objects, because reactivity won't work
        if (
          isPlainObject(data[key]) &&
          // $FlowIgnore : Problem with possibly null this.vm
          data[key] === this.vm[key]
        ) {
          throwError(
            `wrapper.setProps() called with the same object of the existing ` +
              `${key} property. You must call wrapper.setProps() with a new ` +
              `object to trigger reactivity`
          );
        }

        if (
          VUE_VERSION <= 2.3 &&
          (!this.vm ||
            !this.vm.$options._propKeys ||
            !this.vm.$options._propKeys.some(prop => prop === key))
        ) {
          throwError(
            `wrapper.setProps() called with ${key} property which ` +
              `is not defined on the component`
          );
        }

        // $FlowIgnore : Problem with possibly null this.vm
        const parent = this.vm.$parent;
        parent.$set(parent.vueTestUtils_childProps, key, data[key]);
      });

      return nextTick()
    }

    /**
     * Sets element value and triggers input event
     */
    setValue(value) {
      const tagName = this.element.tagName;
      // $FlowIgnore
      const type = this.getAttribute('type');
      this.__warnIfDestroyed();

      if (tagName === 'OPTION') {
        throwError(
          `wrapper.setValue() cannot be called on an <option> element. Use ` +
            `wrapper.setSelected() instead`
        );
      } else if (tagName === 'INPUT' && type === 'checkbox') {
        throwError(
          `wrapper.setValue() cannot be called on a <input type="checkbox" /> ` +
            `element. Use wrapper.setChecked() instead`
        );
      } else if (tagName === 'INPUT' && type === 'radio') {
        throwError(
          `wrapper.setValue() cannot be called on a <input type="radio" /> ` +
            `element. Use wrapper.setChecked() instead`
        );
      } else if (tagName === 'SELECT') {
        if (Array.isArray(value)) {
          // $FlowIgnore
          const options = this.element.options;
          for (let i = 0; i < options.length; i++) {
            const option = options[i];
            option.selected = value.indexOf(option.value) >= 0;
          }
        } else {
          // $FlowIgnore
          this.element.value = value;
        }

        this.trigger('change');
        return nextTick()
      } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        // $FlowIgnore
        this.element.value = value;

        this.trigger('input');

        // for v-model.lazy, we need to trigger a change event, too.
        // $FlowIgnore
        if (this.element._vModifiers && this.element._vModifiers.lazy) {
          this.trigger('change');
        }
        return nextTick()
      }
      throwError(`wrapper.setValue() cannot be called on this element`);
      return nextTick()
    }

    /**
     * Return text of wrapper element
     */
    text() {
      this.__warnIfDestroyed();

      return this.element.textContent.trim()
    }

    /**
     * Simulates event triggering
     */
    __simulateTrigger(type, options) {
      const regularEventTrigger = (type, options) => {
        const event = createDOMEvent(type, options);
        return this.element.dispatchEvent(event)
      };

      const focusEventTrigger = (type, options) => {
        if (this.element instanceof HTMLElement) {
          return this.element.focus()
        }

        regularEventTrigger(type, options);
      };

      const triggerProcedureMap = {
        focus: focusEventTrigger,
        __default: regularEventTrigger
      };

      const triggerFn = triggerProcedureMap[type] || triggerProcedureMap.__default;

      return triggerFn(type, options)
    }

    /**
     * Dispatches a DOM event on wrapper
     */
    trigger(type, options = {}) {
      this.__warnIfDestroyed();

      if (typeof type !== 'string') {
        throwError('wrapper.trigger() must be passed a string');
      }

      if (options.target) {
        throwError(
          `you cannot set the target value of an event. See the notes section ` +
            `of the docs for more details—` +
            `https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`
        );
      }
      const tagName = this.element.tagName;

      if (this.getAttribute('disabled') && supportedTags.has(tagName)) {
        return nextTick()
      }

      this.__simulateTrigger(type, options);
      return nextTick()
    }
  }

  /**
   * Avoids firing events on specific disabled elements
   * See more: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
   */

  const supportedTags = new Set(
    'BUTTON',
    'COMMAND',
    'FIELDSET',
    'KEYGEN',
    'OPTGROUP',
    'OPTION',
    'SELECT',
    'TEXTAREA',
    'INPUT'
  );

  // 


  class VueWrapper extends Wrapper   {
    constructor(vm, options) {
      super(vm._vnode, options, true);
      // $FlowIgnore : issue with defineProperty
      Object.defineProperty(this, 'rootNode', {
        get: () => vm.$vnode || { child: this.vm },
        set: () => throwError('wrapper.vnode is read-only')
      });
      // $FlowIgnore : issue with defineProperty
      Object.defineProperty(this, 'vnode', {
        get: () => vm._vnode,
        set: () => throwError('wrapper.vnode is read-only')
      });
      // $FlowIgnore
      Object.defineProperty(this, 'element', {
        get: () => vm.$el,
        set: () => throwError('wrapper.element is read-only')
      });
      // $FlowIgnore
      Object.defineProperty(this, 'vm', {
        get: () => vm,
        set: () => throwError('wrapper.vm is read-only')
      });
      this.isFunctionalComponent = vm.$options._isFunctionalContainer;
      this._emitted = vm.__emitted;
      this._emittedByOrder = vm.__emittedByOrder;
    }
  }

  // 


  let isEnabled = false;
  const wrapperInstances = [];

  function resetAutoDestroyState() {
    isEnabled = false;
    wrapperInstances.length = 0;
  }

  function enableAutoDestroy(hook) {
    if (isEnabled) {
      throwError('enableAutoDestroy cannot be called more than once');
    }

    isEnabled = true;

    hook(() => {
      wrapperInstances.forEach((wrapper) => {
        // skip child wrappers created by wrapper.find()
        if (wrapper.vm || wrapper.isFunctionalComponent) {
          wrapper.destroy();
        }
      });

      wrapperInstances.length = 0;
    });
  }

  function trackInstance(wrapper) {
    if (!isEnabled) return

    wrapperInstances.push(wrapper);
  }

  // 


  function createWrapper(
    node,
    options = {}
  ) {
    const componentInstance = node.child;
    if (componentInstance) {
      const wrapper = new VueWrapper(componentInstance, options);
      trackInstance(wrapper);
      return wrapper
    }
    const wrapper =
      node instanceof Vue
        ? new VueWrapper(node, options)
        : new Wrapper(node, options);
    trackInstance(wrapper);
    return wrapper
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */

  function listCacheClear$1() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear$1;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */

  function eq$2(value, other) {
    return value === other || (value !== value && other !== other);
  }

  var eq_1 = eq$2;

  var eq$1 = eq_1;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf$4(array, key) {
    var length = array.length;
    while (length--) {
      if (eq$1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var _assocIndexOf = assocIndexOf$4;

  var assocIndexOf$3 = _assocIndexOf;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete$1(key) {
    var data = this.__data__,
        index = assocIndexOf$3(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete$1;

  var assocIndexOf$2 = _assocIndexOf;

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet$1(key) {
    var data = this.__data__,
        index = assocIndexOf$2(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet$1;

  var assocIndexOf$1 = _assocIndexOf;

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas$1(key) {
    return assocIndexOf$1(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas$1;

  var assocIndexOf = _assocIndexOf;

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet$1(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  var _listCacheSet = listCacheSet$1;

  var listCacheClear = _listCacheClear,
      listCacheDelete = _listCacheDelete,
      listCacheGet = _listCacheGet,
      listCacheHas = _listCacheHas,
      listCacheSet = _listCacheSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache$4(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache$4.prototype.clear = listCacheClear;
  ListCache$4.prototype['delete'] = listCacheDelete;
  ListCache$4.prototype.get = listCacheGet;
  ListCache$4.prototype.has = listCacheHas;
  ListCache$4.prototype.set = listCacheSet;

  var _ListCache = ListCache$4;

  var ListCache$3 = _ListCache;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear$1() {
    this.__data__ = new ListCache$3;
    this.size = 0;
  }

  var _stackClear = stackClear$1;

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function stackDelete$1(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete$1;

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function stackGet$1(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet$1;

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function stackHas$1(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas$1;

  /** Detect free variable `global` from Node.js. */

  var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  var _freeGlobal = freeGlobal$1;

  var freeGlobal = _freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$8 = freeGlobal || freeSelf || Function('return this')();

  var _root = root$8;

  var root$7 = _root;

  /** Built-in value references. */
  var Symbol$4 = root$7.Symbol;

  var _Symbol = Symbol$4;

  var Symbol$3 = _Symbol;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$c.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$3 ? Symbol$3.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag$1(value) {
    var isOwn = hasOwnProperty$9.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag$1;

  /** Used for built-in method references. */

  var objectProto$b = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$b.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString$1(value) {
    return nativeObjectToString.call(value);
  }

  var _objectToString = objectToString$1;

  var Symbol$2 = _Symbol,
      getRawTag = _getRawTag,
      objectToString = _objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag$4(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  var _baseGetTag = baseGetTag$4;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */

  function isObject$5(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject$5;

  var baseGetTag$3 = _baseGetTag,
      isObject$4 = isObject_1;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction$2(value) {
    if (!isObject$4(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag$3(value);
    return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction$2;

  var root$6 = _root;

  /** Used to detect overreaching core-js shims. */
  var coreJsData$1 = root$6['__core-js_shared__'];

  var _coreJsData = coreJsData$1;

  var coreJsData = _coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked$1(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var _isMasked = isMasked$1;

  /** Used for built-in method references. */

  var funcProto$1 = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource$2(func) {
    if (func != null) {
      try {
        return funcToString$1.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var _toSource = toSource$2;

  var isFunction$1 = isFunction_1,
      isMasked = _isMasked,
      isObject$3 = isObject_1,
      toSource$1 = _toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto$a = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty$8).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative$1(value) {
    if (!isObject$3(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource$1(value));
  }

  var _baseIsNative = baseIsNative$1;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */

  function getValue$1(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue$1;

  var baseIsNative = _baseIsNative,
      getValue = _getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative$7(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative$7;

  var getNative$6 = _getNative,
      root$5 = _root;

  /* Built-in method references that are verified to be native. */
  var Map$4 = getNative$6(root$5, 'Map');

  var _Map = Map$4;

  var getNative$5 = _getNative;

  /* Built-in method references that are verified to be native. */
  var nativeCreate$4 = getNative$5(Object, 'create');

  var _nativeCreate = nativeCreate$4;

  var nativeCreate$3 = _nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear$1() {
    this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear$1;

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function hashDelete$1(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete$1;

  var nativeCreate$2 = _nativeCreate;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet$1(key) {
    var data = this.__data__;
    if (nativeCreate$2) {
      var result = data[key];
      return result === HASH_UNDEFINED$1 ? undefined : result;
    }
    return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet$1;

  var nativeCreate$1 = _nativeCreate;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas$1(key) {
    var data = this.__data__;
    return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
  }

  var _hashHas = hashHas$1;

  var nativeCreate = _nativeCreate;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet$1(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  var _hashSet = hashSet$1;

  var hashClear = _hashClear,
      hashDelete = _hashDelete,
      hashGet = _hashGet,
      hashHas = _hashHas,
      hashSet = _hashSet;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash$1(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash$1.prototype.clear = hashClear;
  Hash$1.prototype['delete'] = hashDelete;
  Hash$1.prototype.get = hashGet;
  Hash$1.prototype.has = hashHas;
  Hash$1.prototype.set = hashSet;

  var _Hash = Hash$1;

  var Hash = _Hash,
      ListCache$2 = _ListCache,
      Map$3 = _Map;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear$1() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$3 || ListCache$2),
      'string': new Hash
    };
  }

  var _mapCacheClear = mapCacheClear$1;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */

  function isKeyable$1(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  var _isKeyable = isKeyable$1;

  var isKeyable = _isKeyable;

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData$4(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  var _getMapData = getMapData$4;

  var getMapData$3 = _getMapData;

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete$1(key) {
    var result = getMapData$3(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete$1;

  var getMapData$2 = _getMapData;

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet$1(key) {
    return getMapData$2(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet$1;

  var getMapData$1 = _getMapData;

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas$1(key) {
    return getMapData$1(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas$1;

  var getMapData = _getMapData;

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet$1(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet$1;

  var mapCacheClear = _mapCacheClear,
      mapCacheDelete = _mapCacheDelete,
      mapCacheGet = _mapCacheGet,
      mapCacheHas = _mapCacheHas,
      mapCacheSet = _mapCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache$1(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache$1.prototype.clear = mapCacheClear;
  MapCache$1.prototype['delete'] = mapCacheDelete;
  MapCache$1.prototype.get = mapCacheGet;
  MapCache$1.prototype.has = mapCacheHas;
  MapCache$1.prototype.set = mapCacheSet;

  var _MapCache = MapCache$1;

  var ListCache$1 = _ListCache,
      Map$2 = _Map,
      MapCache = _MapCache;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet$1(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache$1) {
      var pairs = data.__data__;
      if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet$1;

  var ListCache = _ListCache,
      stackClear = _stackClear,
      stackDelete = _stackDelete,
      stackGet = _stackGet,
      stackHas = _stackHas,
      stackSet = _stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack$1(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack$1.prototype.clear = stackClear;
  Stack$1.prototype['delete'] = stackDelete;
  Stack$1.prototype.get = stackGet;
  Stack$1.prototype.has = stackHas;
  Stack$1.prototype.set = stackSet;

  var _Stack = Stack$1;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */

  function arrayEach$1(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var _arrayEach = arrayEach$1;

  var getNative$4 = _getNative;

  var defineProperty$1 = (function() {
    try {
      var func = getNative$4(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  var _defineProperty = defineProperty$1;

  var defineProperty = _defineProperty;

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue$2(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue$2;

  var baseAssignValue$1 = _baseAssignValue,
      eq = eq_1;

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue$2(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$5.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue$1(object, key, value);
    }
  }

  var _assignValue = assignValue$2;

  var assignValue$1 = _assignValue,
      baseAssignValue = _baseAssignValue;

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject$4(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue$1(object, key, newValue);
      }
    }
    return object;
  }

  var _copyObject = copyObject$4;

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */

  function baseTimes$1(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var _baseTimes = baseTimes$1;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */

  function isObjectLike$5(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike$5;

  var baseGetTag$2 = _baseGetTag,
      isObjectLike$4 = isObjectLike_1;

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments$1(value) {
    return isObjectLike$4(value) && baseGetTag$2(value) == argsTag$2;
  }

  var _baseIsArguments = baseIsArguments$1;

  var baseIsArguments = _baseIsArguments,
      isObjectLike$3 = isObjectLike_1;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments$1 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike$3(value) && hasOwnProperty$4.call(value, 'callee') &&
      !propertyIsEnumerable$1.call(value, 'callee');
  };

  var isArguments_1 = isArguments$1;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */

  var isArray$3 = Array.isArray;

  var isArray_1 = isArray$3;

  var isBuffer$2 = {exports: {}};

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */

  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;

  isBuffer$2.exports;

  (function (module, exports) {
  	var root = _root,
  	    stubFalse = stubFalse_1;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Built-in value references. */
  	var Buffer = moduleExports ? root.Buffer : undefined;

  	/* Built-in method references for those with the same name as other `lodash` methods. */
  	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  	/**
  	 * Checks if `value` is a buffer.
  	 *
  	 * @static
  	 * @memberOf _
  	 * @since 4.3.0
  	 * @category Lang
  	 * @param {*} value The value to check.
  	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
  	 * @example
  	 *
  	 * _.isBuffer(new Buffer(2));
  	 * // => true
  	 *
  	 * _.isBuffer(new Uint8Array(2));
  	 * // => false
  	 */
  	var isBuffer = nativeIsBuffer || stubFalse;

  	module.exports = isBuffer; 
  } (isBuffer$2, isBuffer$2.exports));

  var isBufferExports = isBuffer$2.exports;

  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex$1(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  var _isIndex = isIndex$1;

  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength$2(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  var isLength_1 = isLength$2;

  var baseGetTag$1 = _baseGetTag,
      isLength$1 = isLength_1,
      isObjectLike$2 = isObjectLike_1;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag$4 = '[object Map]',
      numberTag$2 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$2 = '[object RegExp]',
      setTag$4 = '[object Set]',
      stringTag$2 = '[object String]',
      weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$3 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
  typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
  typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
  typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
  typedArrayTags[uint32Tag$2] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
  typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] =
  typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] =
  typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag$4] = typedArrayTags[numberTag$2] =
  typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$2] =
  typedArrayTags[setTag$4] = typedArrayTags[stringTag$2] =
  typedArrayTags[weakMapTag$2] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray$1(value) {
    return isObjectLike$2(value) &&
      isLength$1(value.length) && !!typedArrayTags[baseGetTag$1(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray$1;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */

  function baseUnary$3(func) {
    return function(value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary$3;

  var _nodeUtil = {exports: {}};

  _nodeUtil.exports;

  (function (module, exports) {
  	var freeGlobal = _freeGlobal;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Detect free variable `process` from Node.js. */
  	var freeProcess = moduleExports && freeGlobal.process;

  	/** Used to access faster Node.js helpers. */
  	var nodeUtil = (function() {
  	  try {
  	    // Use `util.types` for Node.js 10+.
  	    var types = freeModule && freeModule.require && freeModule.require('util').types;

  	    if (types) {
  	      return types;
  	    }

  	    // Legacy `process.binding('util')` for Node.js < 10.
  	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  	  } catch (e) {}
  	}());

  	module.exports = nodeUtil; 
  } (_nodeUtil, _nodeUtil.exports));

  var _nodeUtilExports = _nodeUtil.exports;

  var baseIsTypedArray = _baseIsTypedArray,
      baseUnary$2 = _baseUnary,
      nodeUtil$2 = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil$2 && nodeUtil$2.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray$1 = nodeIsTypedArray ? baseUnary$2(nodeIsTypedArray) : baseIsTypedArray;

  var isTypedArray_1 = isTypedArray$1;

  var baseTimes = _baseTimes,
      isArguments = isArguments_1,
      isArray$2 = isArray_1,
      isBuffer$1 = isBufferExports,
      isIndex = _isIndex,
      isTypedArray = isTypedArray_1;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys$2(value, inherited) {
    var isArr = isArray$2(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer$1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$3.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys$2;

  /** Used for built-in method references. */

  var objectProto$4 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype$3(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

    return value === proto;
  }

  var _isPrototype = isPrototype$3;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */

  function overArg$2(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg$2;

  var overArg$1 = _overArg;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys$1 = overArg$1(Object.keys, Object);

  var _nativeKeys = nativeKeys$1;

  var isPrototype$2 = _isPrototype,
      nativeKeys = _nativeKeys;

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys$1(object) {
    if (!isPrototype$2(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys = baseKeys$1;

  var isFunction = isFunction_1,
      isLength = isLength_1;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike$2(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  var isArrayLike_1 = isArrayLike$2;

  var arrayLikeKeys$1 = _arrayLikeKeys,
      baseKeys = _baseKeys,
      isArrayLike$1 = isArrayLike_1;

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys$3(object) {
    return isArrayLike$1(object) ? arrayLikeKeys$1(object) : baseKeys(object);
  }

  var keys_1 = keys$3;

  var copyObject$3 = _copyObject,
      keys$2 = keys_1;

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign$1(object, source) {
    return object && copyObject$3(source, keys$2(source), object);
  }

  var _baseAssign = baseAssign$1;

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */

  function nativeKeysIn$1(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var _nativeKeysIn = nativeKeysIn$1;

  var isObject$2 = isObject_1,
      isPrototype$1 = _isPrototype,
      nativeKeysIn = _nativeKeysIn;

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn$1(object) {
    if (!isObject$2(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype$1(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$1.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeysIn = baseKeysIn$1;

  var arrayLikeKeys = _arrayLikeKeys,
      baseKeysIn = _baseKeysIn,
      isArrayLike = isArrayLike_1;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn$3(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  var keysIn_1 = keysIn$3;

  var copyObject$2 = _copyObject,
      keysIn$2 = keysIn_1;

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn$1(object, source) {
    return object && copyObject$2(source, keysIn$2(source), object);
  }

  var _baseAssignIn = baseAssignIn$1;

  var _cloneBuffer = {exports: {}};

  _cloneBuffer.exports;

  (function (module, exports) {
  	var root = _root;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Built-in value references. */
  	var Buffer = moduleExports ? root.Buffer : undefined,
  	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

  	/**
  	 * Creates a clone of  `buffer`.
  	 *
  	 * @private
  	 * @param {Buffer} buffer The buffer to clone.
  	 * @param {boolean} [isDeep] Specify a deep clone.
  	 * @returns {Buffer} Returns the cloned buffer.
  	 */
  	function cloneBuffer(buffer, isDeep) {
  	  if (isDeep) {
  	    return buffer.slice();
  	  }
  	  var length = buffer.length,
  	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  	  buffer.copy(result);
  	  return result;
  	}

  	module.exports = cloneBuffer; 
  } (_cloneBuffer, _cloneBuffer.exports));

  var _cloneBufferExports = _cloneBuffer.exports;

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */

  function copyArray$1(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  var _copyArray = copyArray$1;

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */

  function arrayFilter$1(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  var _arrayFilter = arrayFilter$1;

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */

  function stubArray$2() {
    return [];
  }

  var stubArray_1 = stubArray$2;

  var arrayFilter = _arrayFilter,
      stubArray$1 = stubArray_1;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$1.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols$3 = !nativeGetSymbols$1 ? stubArray$1 : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  var _getSymbols = getSymbols$3;

  var copyObject$1 = _copyObject,
      getSymbols$2 = _getSymbols;

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols$1(source, object) {
    return copyObject$1(source, getSymbols$2(source), object);
  }

  var _copySymbols = copySymbols$1;

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */

  function arrayPush$2(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var _arrayPush = arrayPush$2;

  var overArg = _overArg;

  /** Built-in value references. */
  var getPrototype$2 = overArg(Object.getPrototypeOf, Object);

  var _getPrototype = getPrototype$2;

  var arrayPush$1 = _arrayPush,
      getPrototype$1 = _getPrototype,
      getSymbols$1 = _getSymbols,
      stubArray = stubArray_1;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn$2 = !nativeGetSymbols ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush$1(result, getSymbols$1(object));
      object = getPrototype$1(object);
    }
    return result;
  };

  var _getSymbolsIn = getSymbolsIn$2;

  var copyObject = _copyObject,
      getSymbolsIn$1 = _getSymbolsIn;

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn$1(source, object) {
    return copyObject(source, getSymbolsIn$1(source), object);
  }

  var _copySymbolsIn = copySymbolsIn$1;

  var arrayPush = _arrayPush,
      isArray$1 = isArray_1;

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys$2(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys$2;

  var baseGetAllKeys$1 = _baseGetAllKeys,
      getSymbols = _getSymbols,
      keys$1 = keys_1;

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys$1(object) {
    return baseGetAllKeys$1(object, keys$1, getSymbols);
  }

  var _getAllKeys = getAllKeys$1;

  var baseGetAllKeys = _baseGetAllKeys,
      getSymbolsIn = _getSymbolsIn,
      keysIn$1 = keysIn_1;

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn$1(object) {
    return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
  }

  var _getAllKeysIn = getAllKeysIn$1;

  var getNative$3 = _getNative,
      root$4 = _root;

  /* Built-in method references that are verified to be native. */
  var DataView$1 = getNative$3(root$4, 'DataView');

  var _DataView = DataView$1;

  var getNative$2 = _getNative,
      root$3 = _root;

  /* Built-in method references that are verified to be native. */
  var Promise$2 = getNative$2(root$3, 'Promise');

  var _Promise = Promise$2;

  var getNative$1 = _getNative,
      root$2 = _root;

  /* Built-in method references that are verified to be native. */
  var Set$2 = getNative$1(root$2, 'Set');

  var _Set = Set$2;

  var getNative = _getNative,
      root$1 = _root;

  /* Built-in method references that are verified to be native. */
  var WeakMap$1 = getNative(root$1, 'WeakMap');

  var _WeakMap = WeakMap$1;

  var DataView = _DataView,
      Map$1 = _Map,
      Promise$1 = _Promise,
      Set$1 = _Set,
      WeakMap = _WeakMap,
      baseGetTag = _baseGetTag,
      toSource = _toSource;

  /** `Object#toString` result references. */
  var mapTag$3 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$3 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$2 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map$1),
      promiseCtorString = toSource(Promise$1),
      setCtorString = toSource(Set$1),
      weakMapCtorString = toSource(WeakMap);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag$3 = baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((DataView && getTag$3(new DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
      (Map$1 && getTag$3(new Map$1) != mapTag$3) ||
      (Promise$1 && getTag$3(Promise$1.resolve()) != promiseTag) ||
      (Set$1 && getTag$3(new Set$1) != setTag$3) ||
      (WeakMap && getTag$3(new WeakMap) != weakMapTag$1)) {
    getTag$3 = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$2;
          case mapCtorString: return mapTag$3;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$3;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var _getTag = getTag$3;

  /** Used for built-in method references. */

  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray$1(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var _initCloneArray = initCloneArray$1;

  var root = _root;

  /** Built-in value references. */
  var Uint8Array$1 = root.Uint8Array;

  var _Uint8Array = Uint8Array$1;

  var Uint8Array = _Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer$3(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }

  var _cloneArrayBuffer = cloneArrayBuffer$3;

  var cloneArrayBuffer$2 = _cloneArrayBuffer;

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView$1(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer$2(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  var _cloneDataView = cloneDataView$1;

  /** Used to match `RegExp` flags from their coerced string values. */

  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp$1(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  var _cloneRegExp = cloneRegExp$1;

  var Symbol$1 = _Symbol;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol$1(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  var _cloneSymbol = cloneSymbol$1;

  var cloneArrayBuffer$1 = _cloneArrayBuffer;

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray$1(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer$1(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var _cloneTypedArray = cloneTypedArray$1;

  var cloneArrayBuffer = _cloneArrayBuffer,
      cloneDataView = _cloneDataView,
      cloneRegExp = _cloneRegExp,
      cloneSymbol = _cloneSymbol,
      cloneTypedArray = _cloneTypedArray;

  /** `Object#toString` result references. */
  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag$1 = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag$1(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$1:
        return cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return cloneTypedArray(object, isDeep);

      case mapTag$2:
        return new Ctor;

      case numberTag$1:
      case stringTag$1:
        return new Ctor(object);

      case regexpTag$1:
        return cloneRegExp(object);

      case setTag$2:
        return new Ctor;

      case symbolTag$1:
        return cloneSymbol(object);
    }
  }

  var _initCloneByTag = initCloneByTag$1;

  var isObject$1 = isObject_1;

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate$1 = (function() {
    function object() {}
    return function(proto) {
      if (!isObject$1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  var _baseCreate = baseCreate$1;

  var baseCreate = _baseCreate,
      getPrototype = _getPrototype,
      isPrototype = _isPrototype;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject$1(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototype(object))
      : {};
  }

  var _initCloneObject = initCloneObject$1;

  var getTag$2 = _getTag,
      isObjectLike$1 = isObjectLike_1;

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]';

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap$1(value) {
    return isObjectLike$1(value) && getTag$2(value) == mapTag$1;
  }

  var _baseIsMap = baseIsMap$1;

  var baseIsMap = _baseIsMap,
      baseUnary$1 = _baseUnary,
      nodeUtil$1 = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap;

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap$1 = nodeIsMap ? baseUnary$1(nodeIsMap) : baseIsMap;

  var isMap_1 = isMap$1;

  var getTag$1 = _getTag,
      isObjectLike = isObjectLike_1;

  /** `Object#toString` result references. */
  var setTag$1 = '[object Set]';

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet$1(value) {
    return isObjectLike(value) && getTag$1(value) == setTag$1;
  }

  var _baseIsSet = baseIsSet$1;

  var baseIsSet = _baseIsSet,
      baseUnary = _baseUnary,
      nodeUtil = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsSet = nodeUtil && nodeUtil.isSet;

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet$1 = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

  var isSet_1 = isSet$1;

  var Stack = _Stack,
      arrayEach = _arrayEach,
      assignValue = _assignValue,
      baseAssign = _baseAssign,
      baseAssignIn = _baseAssignIn,
      cloneBuffer = _cloneBufferExports,
      copyArray = _copyArray,
      copySymbols = _copySymbols,
      copySymbolsIn = _copySymbolsIn,
      getAllKeys = _getAllKeys,
      getAllKeysIn = _getAllKeysIn,
      getTag = _getTag,
      initCloneArray = _initCloneArray,
      initCloneByTag = _initCloneByTag,
      initCloneObject = _initCloneObject,
      isArray = isArray_1,
      isBuffer = isBufferExports,
      isMap = isMap_1,
      isObject = isObject_1,
      isSet = isSet_1,
      keys = keys_1,
      keysIn = keysIn_1;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$1 = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG$1 = 4;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone$1(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG$1,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value),
          isFunc = tag == funcTag || tag == genTag;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone$1(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone$1(subValue, bitmask, customizer, key, value, stack));
      });
    }

    var keysFunc = isFull
      ? (isFlat ? getAllKeysIn : getAllKeys)
      : (isFlat ? keysIn : keys);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(result, key, baseClone$1(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  var _baseClone = baseClone$1;

  var baseClone = _baseClone;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_SYMBOLS_FLAG = 4;

  /**
   * This method is like `_.clone` except that it recursively clones `value`.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Lang
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @see _.clone
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var deep = _.cloneDeep(objects);
   * console.log(deep[0] === objects[0]);
   * // => false
   */
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }

  var cloneDeep_1 = cloneDeep;

  var cloneDeep$1 = /*@__PURE__*/getDefaultExportFromCjs(cloneDeep_1);

  // 


  /**
   * Used internally by vue-server-test-utils and test-utils to propagate/create vue instances.
   * This method is wrapped by createLocalVue in test-utils to provide a different public API signature
   * @param {Component} _Vue
   * @param {VueConfig} config
   * @returns {Component}
   */
  function _createLocalVue(
    _Vue = Vue,
    config = {}
  ) {
    const instance = _Vue.extend();

    // clone global APIs
    keys$4(_Vue).forEach(key => {
      if (!instance.hasOwnProperty(key)) {
        const original = _Vue[key];
        // cloneDeep can fail when cloning Vue instances
        // cloneDeep checks that the instance has a Symbol
        // which errors in Vue < 2.17 (https://github.com/vuejs/vue/pull/7878)
        try {
          instance[key] =
            typeof original === 'object' ? cloneDeep$1(original) : original;
        } catch (e) {
          instance[key] = original;
        }
      }
    });

    // config is not enumerable
    instance.config = cloneDeep$1(Vue.config);

    // if a user defined errorHandler is defined by a localVue instance via createLocalVue, register it
    instance.config.errorHandler = config.errorHandler;

    // option merge strategies need to be exposed by reference
    // so that merge strats registered by plugins can work properly
    instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

    // make sure all extends are based on this instance.
    // this is important so that global components registered by plugins,
    // e.g. router-link are created using the correct base constructor
    instance.options._base = instance;

    // compat for vue-router < 2.7.1 where it does not allow multiple installs
    if (instance._installedPlugins && instance._installedPlugins.length) {
      instance._installedPlugins.length = 0;
    }
    const use = instance.use;
    instance.use = (plugin, ...rest) => {
      if (plugin.installed === true) {
        plugin.installed = false;
      }
      if (plugin.install && plugin.install.installed === true) {
        plugin.install.installed = false;
      }
      use.call(instance, plugin, ...rest);
    };
    return instance
  }

  // 


  function isValidSlot(slot) {
    return isVueComponent(slot) || typeof slot === 'string'
  }

  function requiresTemplateCompiler(slot) {
    if (typeof slot === 'string' && !vueTemplateCompiler.compileToFunctions) {
      throwError(
        `vueTemplateCompiler is undefined, you must pass ` +
          `precompiled components if vue-template-compiler is ` +
          `undefined`
      );
    }
  }

  function validateSlots(slots) {
    keys$4(slots).forEach(key => {
      const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];

      slot.forEach(slotValue => {
        if (!isValidSlot(slotValue)) {
          throwError(
            `slots[key] must be a Component, string or an array ` +
              `of Components`
          );
        }
        requiresTemplateCompiler(slotValue);
      });
    });
  }

  function vueExtendUnsupportedOption(option) {
    return (
      `options.${option} is not supported for ` +
      `components created with Vue.extend in Vue < 2.3. ` +
      `You can set ${option} to false to mount the component.`
    )
  }
  // these options aren't supported if Vue is version < 2.3
  // for components using Vue.extend. This is due to a bug
  // that means the mixins we use to add properties are not applied
  // correctly
  const UNSUPPORTED_VERSION_OPTIONS = ['mocks', 'stubs', 'localVue'];

  function validateOptions(options, component) {
    if (
      options.attachTo &&
      !isHTMLElement(options.attachTo) &&
      !isDomSelector(options.attachTo)
    ) {
      throwError(
        `options.attachTo should be a valid HTMLElement or CSS selector string`
      );
    }
    if ('attachToDocument' in options) {
      warnDeprecated(
        `options.attachToDocument is deprecated in favor of options.attachTo and will be removed in a future release`
      );
    }
    if (options.parentComponent && !isPlainObject(options.parentComponent)) {
      throwError(
        `options.parentComponent should be a valid Vue component options object`
      );
    }

    if (!isFunctionalComponent(component) && options.context) {
      throwError(
        `mount.context can only be used when mounting a functional component`
      );
    }

    if (options.context && !isPlainObject(options.context)) {
      throwError('mount.context must be an object');
    }

    if (VUE_VERSION < 2.3 && isConstructor(component)) {
      UNSUPPORTED_VERSION_OPTIONS.forEach(option => {
        if (options[option]) {
          throwError(vueExtendUnsupportedOption(option));
        }
      });
    }

    if (options.slots) {
      compileTemplateForSlots(options.slots);
      // validate slots outside of the createSlots function so
      // that we can throw an error without it being caught by
      // the Vue error handler
      // $FlowIgnore
      validateSlots(options.slots);
    }
  }

  Vue.config.productionTip = false;
  Vue.config.devtools = false;

  function mount(component, options = {}) {
    warnIfNoWindow();

    polyfill();

    addGlobalErrorHandler(Vue);

    const _Vue = _createLocalVue(
      options.localVue,
      options.localVue ? options.localVue.config : undefined
    );

    const mergedOptions = mergeOptions(options, config);

    validateOptions(mergedOptions, component);

    const parentVm = createInstance(component, mergedOptions, _Vue);

    const el =
      options.attachToDocument || options.attachTo instanceof HTMLBodyElement
        ? createElement()
        : options.attachTo;
    const vm = parentVm.$mount(el);

    component._Ctor = {};

    throwIfInstancesThrew(vm);

    const wrapperOptions = {
      attachedToDocument: !!el
    };

    const root = parentVm.$options._isFunctionalContainer
      ? vm._vnode
      : vm.$children[0];

    return createWrapper(root, wrapperOptions)
  }

  // 



  function shallowMount(
    component,
    options = {}
  ) {
    return mount(component, {
      ...options,
      shouldProxy: true
    })
  }

  // 


  /**
   * Returns a local vue instance to add components, mixins and install plugins without polluting the global Vue class
   * @param {VueConfig} config
   * @returns {Component}
   */
  function createLocalVue(config = {}) {
    return _createLocalVue(undefined, config)
  }

  // 
  const toTypes = [String, Object];
  const eventTypes = [String, Array];

  var RouterLinkStub = {
    name: 'RouterLinkStub',
    props: {
      to: {
        type: toTypes,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      exact: Boolean,
      exactPath: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      exactPathActiveClass: String,
      event: {
        type: eventTypes,
        default: 'click'
      }
    },
    render(h) {
      return h(this.tag, undefined, this.$slots.default)
    }
  };

  function shallow(component, options) {
    warn(
      `shallow has been renamed to shallowMount. shallow ` +
        `will be removed in 1.0.0, use shallowMount instead`
    );
    return shallowMount(component, options)
  }

  exports.ErrorWrapper = ErrorWrapper;
  exports.RouterLinkStub = RouterLinkStub;
  exports.Wrapper = Wrapper;
  exports.WrapperArray = WrapperArray;
  exports.config = config;
  exports.createLocalVue = createLocalVue;
  exports.createWrapper = createWrapper;
  exports.enableAutoDestroy = enableAutoDestroy;
  exports.mount = mount;
  exports.resetAutoDestroyState = resetAutoDestroyState;
  exports.shallow = shallow;
  exports.shallowMount = shallowMount;

}));
