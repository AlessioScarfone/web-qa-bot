import { describe, it } from "node:test";
import assert from "node:assert";
import { askQuestion, isValidUrl } from "../src/utils.js";

describe('Utils - isValidUrl', () => {
    it('isValidUrl ok 1', () => {
        assert.ok(isValidUrl("https://wikipedia.com/"))
        assert.ok(isValidUrl("http://www.wikipedia.com/"))
        assert.ok(isValidUrl("http://www.wikipedia.com/?q=test"))
        assert.ok(isValidUrl("http://www.wikipedia.com?q=test"))
    });

    it('isValidUrl ko', () => {
        assert.equal(isValidUrl(""), false)
        assert.equal(isValidUrl("wikipedia"), false)
        assert.equal(isValidUrl(null), false)
        assert.equal(isValidUrl(undefined), false)
    });
});
