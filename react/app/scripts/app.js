'use strict';

import React from 'react';
import {render} from 'react-dom';
import {List} from 'immutable';
import io from 'socket.io-client';
import moment from 'moment';

var bgs = {
  'completed': 'black',
  'transit': 'white',
  'picking': 'red',
  'scheduled': 'blue',
  'reserved': 'green'
};
var colors = {
  'completed': 'white',
  'transit': 'black',
  'picking': 'white',
  'scheduled': 'white',
  'reserved': 'white'
};

const Order = React.createClass({
  propTypes: {
    order: (props, propName) => {
      var order = props[propName];
      if (order.id === undefined || order.status === undefined || order.img === undefined) {
        return new Error('Invalid Order');
      }
    }
  },
  render: function () {
    let background = {
      backgroundColor: bgs[this.props.order.status],
      color: colors[this.props.order.status],
    };

    return <div className="col-md-1" style={background}>
      <div className="col-md-10 col-md-offset-1">
        <img src={this.props.order.img}/><span style={{paddingLeft: '0.5em'}}>Id: {this.props.order.id}</span>
      </div>
      <div className="col-md-10 col-md-offset-1">Status: {this.props.order.status}</div>
    </div>
  },
  shouldComponentUpdate: function (nextProps) {
    return this.props.order.status !== nextProps.order.status || this.props.order.img !== nextProps.order.img;
  }
});

const OrderList = React.createClass({
  propTypes: {
    orders: React.PropTypes.instanceOf(List)
  },
  render: function () {
    let orders = this.props.orders.map((_order) => <Order order={_order} key={_order.id}></Order>);
    var time = getTime();

    return <div className="row">
      <h1 class="col-md-12">{timestamp} - {time}</h1>
      {orders}
    </div>
  }
});

let orders = new List([{
  id: 1,
  status: 'completed',
  img: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gNjUK/9sAQwALCAgKCAcLCgkKDQwLDREcEhEPDxEiGRoUHCkkKyooJCcnLTJANy0wPTAnJzhMOT1DRUhJSCs2T1VORlRAR0hF/9sAQwEMDQ0RDxEhEhIhRS4nLkVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVF/8AAEQgAFAAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Awb/SRJLBNA8qeZGqOJEPysB29jXOzRumpiFrVGlLbckkZPt0xXskk2i3gQSXOoBsjdIZk55/iAOMfQV51qWgxG7uZLe4ctvPksY24Tn8z0FAHR6dfTz2gMrsXQ7CS3XH0oq14esNKs9HhSWVzM2WkL8EsfbNFAGCCcdTUUrt60UUAVWlfceaKKKAP//Z'
}]);
let timestamp;
const getTime = () => {
  return moment(timestamp).format('h:mm:ss.SSS');
};


let socket = io.connect('localhost:3030');
socket.on('orders', (_orders) => {
  timestamp = Date.now();
  orders = new List(_orders);
  doRender();
});

const doRender = function() {
  render(<OrderList orders={orders}></OrderList>, document.getElementById('app'));
};

doRender();
