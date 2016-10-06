'use strict';

import angular from 'angular';
import ngRoute from 'angular-router-browserify';
import io from 'socket.io-client';
import {List} from 'immutable';

ngRoute(angular);

angular
  .module('ngDemoApp', ['ngRoute'])
  .config(config)
  .component('orderList', orderList())
  .component('order', order())
  .factory('socket', socket)
  .factory('orders', orders);

config.$inject = ['$routeProvider'];
function config($routeProvider) {
  $routeProvider
    .when('/', {
      template: '<order-list></order-list>'
    })
    .otherwise('/');
}

function order() {
  OrderController.$inject = [];

  return {
    template: orderTemplate,
    controller: OrderController,
    bindings: {order: '='},
    controllerAs: 'vm'
  };

  function OrderController() {
    var vm = this;

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

    Object.defineProperties(vm, {
      id: {get: () => vm.order.id},
      status: {get: () => vm.order.status},
      img: {get: () => vm.order.img},
      background: {
        get: () => {
          return {
            'background-color': bgs[vm.order.status],
            'backgroundColor': bgs[vm.order.status],
            'color': colors[vm.order.status]
          }
        }
      }
    })
  }

  function orderTemplate() {
    return '' +
      '<div class="col-md-12" ng-style="vm.background">' +
      '  <div class="col-md-10 col-md-offset-1"><img ng-src="{{vm.img}}" /><span style="padding-left: 0.5em">Id: {{vm.id}}</span></div>' +
      '  <div class="col-md-10 col-md-offset-1">Status: {{vm.status}}</div>' +
      '</div>' +
      '';
  }
}

function orderList() {
  OrderListController.$inject = ['orders', '$scope'];

  return {
    template: '<div class="row"><h1 class="col-md-12">{{vm.timestamp}} - {{vm.date | date : vm.timeFilter}}</h1><order class="col-md-1" ng-repeat="order in vm.orders track by order.id" order="order"></order></div>',
    controller: OrderListController,
    controllerAs: 'vm'
  };

  function OrderListController(orders, $scope) {
    var vm = this;

    vm.timeFilter = 'h:mm:ss.sss';
    vm.orders = [{id: 1, status: 'completed'}];

    orders.onOrders((orders) => {
      vm.timestamp = Date.now();
      vm.date = new Date(vm.timestamp);
      $scope.$apply(() => vm.orders = orders);
    });

  }
}

orders.$inject = ['socket'];
function orders(socket) {
  var service = {
    getOrders: function () {
      return orders;
    },
    onOrders: onOrders
  };

  let listeners = [];
  let orders = [];//_.concat(... filled);

  socket.onOrders((_orders) => {
    console.log('new orders');
    orders = _orders;

    listeners.forEach((cb) => cb(orders));
  });

  return service;

  function onOrders(listener) {
    listeners.push(listener);
  }
}

socket.$inject = [];
function socket() {
  var service = {
    onOrders: onOrders
  };

  let listeners = [];

  let socket = io.connect('localhost:3030');
  socket.on('orders', (orders) => {
    window.timestamp = Date.now();
    listeners.forEach((cb) => cb(new List(orders).toArray()));
  });

  return service;

  function onOrders(listener) {
    listeners.push(listener);
  }
}