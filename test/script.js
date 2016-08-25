var Lab = require("lab");
var server = require("../server.js").server;
var lab = exports.lab = Lab.script();
var code = require("code");


lab.test("PositiveTesting", function(done) {
    var options = {
        method: "GET",
        url: "/job?page=1&size=3&q=chief"
    };
 
    server.inject(options, function(response) {
        var result = response.result;
 
        code.expect(response.statusCode).to.equal(200);
        code.expect(result).to.be.instanceof(Array);
        code.expect(result).to.have.length(1);
        done();
    });
});

// Set param page = 0
lab.test("NegativeTesting1", function(done) {
    var options = {
        method: "GET",
        url: "/job?page=0&size=3&q=chief"
    };
 
    server.inject(options, function(response) {
        var result = response.result;
 
        code.expect(response.statusCode).to.equal(200);
        code.expect(result).to.be.instanceof(Array);
        code.expect(result).to.have.length(1);
        done();
    });
});

// Omit page param
lab.test("NegativeTesting2", function(done) {
    var options = {
        method: "GET",
        url: "/job?size=3&q=chief"
    };
 
    server.inject(options, function(response) {
        var result = response.result;
 
        code.expect(response.statusCode).to.equal(200);
        code.expect(result).to.be.instanceof(Array);
        code.expect(result).to.have.length(1);
        done();
    });
});

// Omit size param
lab.test("NegativeTesting3", function(done) {
    var options = {
        method: "GET",
        url: "/job?q=chief"
    };
 
    server.inject(options, function(response) {
        var result = response.result;
 
        code.expect(response.statusCode).to.equal(200);
        code.expect(result).to.be.instanceof(Array);
        code.expect(result).to.have.length(1);
        done();
    });
});

// No param
lab.test("DestructiveTesting", function(done) {
    var options = {
        method: "GET",
        url: "/job"
    };
 
    server.inject(options, function(response) {
        var result = response.result;
 
        code.expect(response.statusCode).to.equal(400);
        done();
    });
});
