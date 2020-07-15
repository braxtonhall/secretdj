import Handlebars from 'handlebars/runtime';

Handlebars.registerHelper('eq', function (this, a, b, opts) {
	if (a === b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});

Handlebars.registerHelper('noteq', function (this, a, b, opts) {
	if (a !== b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});

Handlebars.registerHelper('includes', function (this, a, b, opts) {
	if (a.includes(b)) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});

Handlebars.registerHelper('hyphenate', (...args) => {
	args.pop(); // last argument is Handlebars context
	return args.join('-');
});
