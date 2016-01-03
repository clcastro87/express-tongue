/**
 * Copyright 2015
 * Developed by Spissa Software Solutions
 * Created by Carlos on 1/1/2016.
 */

var expect = require('chai').expect;
var app = require('../server').app;
var request = require('supertest');

describe('Localization', function () {

    it('localization endpoint available', function (done) {
        request(app)
            .get('/i18n')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('object');
                expect(json.lang).to.be.a('string');
                expect(json.language).to.be.a('string');
                expect(json.strings).to.be.a('object');
                done(err);
            });
    });

    it('localization languages available', function (done) {
        request(app)
            .get('/i18n/languages')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('array');
                done(err);
            });
    });

    it('localization strings available', function (done) {
        request(app)
            .get('/i18n/strings')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('object');
                expect(json.test).to.not.null();
                done(err);
            });
    });

    it('localization in default lang (en)', function (done) {
        request(app)
            .get('/i18n')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('object');
                expect(json.lang).to.be.a('string');
                expect(json.language).to.be.a('string');
                expect(json.strings).to.be.a('object');
                expect(json.lang).to.equal('en');
                done(err);
            });
    });

    it('localization in spanish using User-Agent', function (done) {
        request(app)
            .get('/i18n')
            .set('Accept-Language', 'es')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('object');
                expect(json.lang).to.be.a('string');
                expect(json.language).to.be.a('string');
                expect(json.strings).to.be.a('object');
                expect(json.lang).to.equal('es');
                done(err);
            });
    });

    it('localization in spanish using QueryString', function (done) {
        request(app)
            .get('/i18n?hl=es')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.not.null();
                var json = res.body;
                expect(json).to.be.an('object');
                expect(json.lang).to.be.a('string');
                expect(json.language).to.be.a('string');
                expect(json.strings).to.be.a('object');
                expect(json.lang).to.equal('es');
                expect('set-cookie', 'cookie=xp_i18n_lang; Path=/');
                done(err);
            });
    });

});
