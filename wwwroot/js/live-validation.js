/*
 * Live green/red feedback on mandatory fields. On by default, everywhere.
 *
 * The house rule: a mandatory field turns green the moment it holds something
 * acceptable, and red once it has been left empty or wrong — never red before
 * it has been touched, because a form should not open covered in warnings.
 *
 * This is loaded from _Layout, so every form in the application has it without
 * asking. There is nothing to remember when adding a new form: mark the fields
 * that must be filled in `required` and the behaviour follows.
 *
 * Deliberately only `required` fields go green. A search box, a filter, an
 * optional note — none of those are an achievement to fill in, and ticking
 * them would make the mark mean nothing. An optional field still goes red if
 * it holds something malformed, because that is worth knowing either way.
 *
 * Opting out:
 *   <form data-no-live-validate>   a form that marks its own fields
 *   <input data-no-live-validate>  one field within a form that does not
 *
 * Read-only and disabled fields are skipped: they were not filled in by the
 * person reading the form, so there is nothing to tell them about. A form
 * locked as a whole — a submitted application read back on a disabled
 * fieldset — is not that: every answer on it was filled in by somebody, and
 * it is marked as the person who filled it in saw it.
 *
 * This is feedback only. The server validates everything again — nothing here
 * decides what is accepted.
 */
(function () {
    'use strict';

    var FIELDS = 'input, select, textarea';
    var SKIP_TYPES = ['hidden', 'submit', 'button', 'reset', 'image', 'file'];

    /** A field nobody is being asked to fill in right now. */
    function isHidden(field) {
        if (field.disabled) return true;
        if (field.closest('[hidden]') !== null) return true;

        // A field holding an answer is marked whether or not it is on screen.
        //
        // Out of sight means one of two things. A field put away by a choice
        // above it is cleared as it goes, so it is empty, and the test below
        // still catches it. A step of the form nobody has opened yet keeps
        // its answers — and a submitted application read back a step at a
        // time is entirely that: every step but the first is out of sight, so
        // every answer on it went unmarked and sat on the red that a required
        // field starts on. Which is why the marks appeared only once a step
        // was opened.
        if (hasValue(field)) return false;

        // Read-only and empty: nobody is being asked to fill it, so nothing is
        // said about it. Read-only and filled is caught above — a locked
        // calculation is read back marked as the person who ran it saw it.
        if (field.readOnly) return true;

        return field.offsetParent === null && field.type !== 'radio' && field.type !== 'checkbox';
    }

    /** Radios carry their state across the group, not on one element. */
    function isChoice(field) {
        return field.type === 'radio' || field.type === 'checkbox';
    }

    function group(field) {
        if (field.type !== 'radio' || !field.name) return [field];

        // Scoped to the form where there is one, and to the page where there
        // is not — the calculator is a panel of fields with no form around it.
        var scope = field.form || document;

        return Array.prototype.slice.call(
            scope.querySelectorAll('input[type="radio"][name="' + CSS.escape(field.name) + '"]'));
    }

    function hasValue(field) {
        if (isChoice(field)) {
            return group(field).some(function (item) { return item.checked; });
        }

        return (field.value || '').trim().length > 0;
    }

    /**
     * @param {boolean} touched Whether the person has been in this field and
     *        left it. Until then an empty field is unanswered, not wrong.
     */
    function paint(field, touched) {
        var targets = group(field);

        function clear() {
            targets.forEach(function (item) { item.classList.remove('is-valid', 'is-invalid'); });
        }

        if (isHidden(field)) {
            clear();
            return;
        }

        var filled = hasValue(field);
        var valid = field.checkValidity();

        // Optional and empty is a perfectly good answer, so say nothing.
        if (!field.required && !filled) {
            clear();
            return;
        }

        // Optional but filled in: no tick for it — only a warning if what is
        // there is malformed.
        if (!field.required) {
            targets.forEach(function (item) {
                item.classList.remove('is-valid');
                item.classList.toggle('is-invalid', !valid);
            });
            return;
        }

        if (!filled && !touched) {
            clear();
            return;
        }

        var ok = filled && valid;
        targets.forEach(function (item) {
            item.classList.toggle('is-valid', ok);
            item.classList.toggle('is-invalid', !ok);
        });
    }

    /*
     * The one place this copy differs from the loan application's.
     *
     * There the page is delivered whole and every field is present when the
     * document is ready, so binding once on DOMContentLoaded is enough. Here
     * Blazor replaces the fields as the answers change — the drawdown swaps
     * between a locked box and a list, and moving between Inputs and Results
     * never reloads the document — so a field bound once is a field that
     * stops being marked the moment it is re-rendered.
     *
     * The behaviour is the loan application's, unchanged. Only the moment of
     * binding is: every field is bound as it appears, and each is bound once.
     */
    var bound = new WeakSet();

    function bind(fields) {
        fields.forEach(function (field) {
            if (bound.has(field)) return;
            bound.add(field);

            var event = isChoice(field) || field.tagName === 'SELECT' ? 'change' : 'input';

            field.addEventListener(event, function () { paint(field, false); });
            field.addEventListener('blur', function () { paint(field, true); });

            // Anything already filled in — a value carried back from a failed
            // submit, or one the server put there — is marked straight away.
            if (hasValue(field)) paint(field, false);
        });
    }

    /**
     * Every field on the page, not only fields inside a form. The calculator
     * is a panel of inputs with no form around it — worked out in the
     * browser rather than submitted — and binding to forms alone would leave
     * exactly the fields somebody is filling in unmarked.
     */
    function fields() {
        return Array.prototype.slice.call(document.querySelectorAll(FIELDS))
            .filter(function (field) {
                return SKIP_TYPES.indexOf(field.type) === -1
                    && !field.hasAttribute('data-no-live-validate')
                    && !field.closest('[data-no-live-validate]');
            });
    }

    function start() {
        bind(fields());

        // A section revealed or put away by a choice above it: what is now
        // hidden loses its mark, what has just appeared starts unmarked.
        document.addEventListener('change', function () {
            fields().forEach(function (field) {
                if (isHidden(field) || !hasValue(field)) paint(field, false);
            });
        });

        // Fields Blazor puts on the page after it has loaded.
        new MutationObserver(function () { bind(fields()); })
            .observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
