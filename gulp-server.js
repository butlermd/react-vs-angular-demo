'use strict';
var _ = require('lodash');

module.exports = function (gulp) {
  gulp.task('server', function () {

    var express = require('express');
    var httpLib = require('http');
    var socketIo = require('socket.io');

    var app = express();
    var http = httpLib.Server(app);
    var io = socketIo(http);

    var orders = generateOrders();

    setInterval(sendOrders, 10000);

    http.listen(3030, function () {
      console.log('express starting on 3030');
    });

    function sendOrders() {
      changeOrders(orders);
      io.emit('orders', orders);
    }
  });
};

function generateOrders() {
  var size = 312 * 10;

  var orders = [];
  for (var i = 0; i < size; i++) {
    var order = orders[i] = {id: i};

    randomizeStatusAndImg(order);
  }

  return orders;
}

function randomizeStatusAndImg(order) {
  order.img = imgs[_.random(0, imgs.length - 1)];
  order.status = statuses[_.random(0, statuses.length - 1)];
}

function changeOrders(orders) {
  var numberToChange = _.random(0, orders.length - 1);

  var indicesToChange = {};
  for (let i = 0; i < numberToChange; i++) {
    var index;

    do {
      index = _.random(0, orders.length - 1);
    } while (indicesToChange[index]);

    indicesToChange[index] = true;
  }

  indicesToChange = _.keys(indicesToChange);
  for (let i = 0; i < indicesToChange.length; i++) {
    var order = orders[parseInt(indicesToChange[i])];
    randomizeStatusAndImg(order);
  }
}

var imgs = [
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gNjUK/9sAQwALCAgKCAcLCgkKDQwLDREcEhEPDxEiGRoUHCkkKyooJCcnLTJANy0wPTAnJzhMOT1DRUhJSCs2T1VORlRAR0hF/9sAQwEMDQ0RDxEhEhIhRS4nLkVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVF/8AAEQgAFAAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Awb/SRJLBNA8qeZGqOJEPysB29jXOzRumpiFrVGlLbckkZPt0xXskk2i3gQSXOoBsjdIZk55/iAOMfQV51qWgxG7uZLe4ctvPksY24Tn8z0FAHR6dfTz2gMrsXQ7CS3XH0oq14esNKs9HhSWVzM2WkL8EsfbNFAGCCcdTUUrt60UUAVWlfceaKKKAP//Z',
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gNjUK/9sAQwALCAgKCAcLCgkKDQwLDREcEhEPDxEiGRoUHCkkKyooJCcnLTJANy0wPTAnJzhMOT1DRUhJSCs2T1VORlRAR0hF/9sAQwEMDQ0RDxEhEhIhRS4nLkVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVF/8AAEQgAFAAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8AoRxXl/FvEaiUhRgnG4/5xWDqct5Z3iRSWkikMN24EAj0BrvJNJkaWa1tMPKwGyZvugfT0IGK0PEWgQs9tOz7ni4O7GCD1GPrXNyQb5rHR7SSVrnnk2x5NyReWGAO3PTiitLUbG8bUJ2hti0ZYkMp4NFYOnK+x0KrG250HgvUrm4sFaVgzRsEDEc4rsbqCO4QSSKCwFFFdUNjkn8RzF1dyQzFU2gfSiiigR//2Q=='
];
var statuses = [
  'completed',
  'transit',
  'picking',
  'scheduled',
  'reserved'
];