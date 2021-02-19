'use strict';

import * as Chart from 'chart.js';
import {rnd} from '../data';

export const defaults = {
  ...Chart.defaults.global.elements.rectangle,
  borderWidth: 1,
  outlierRadius: 2,
  outlierColor: Chart.defaults.global.elements.rectangle.backgroundColor,
  lowerColor: Chart.defaults.global.elements.rectangle.lowerColor,
  medianColor: null,
  itemRadius: 0,
  itemStyle: 'circle',
  itemBackgroundColor: Chart.defaults.global.elements.rectangle.backgroundColor,
  itemBorderColor: Chart.defaults.global.elements.rectangle.borderColor,
  hitPadding: 2,
  outlierHitRadius: 8,
  tooltipDecimals: 2
};

const ArrayElementBase = Chart.Element.extend({
  isVertical() {
    return this._view.width !== undefined;
  },
  draw() {
    // abstract
  },
  _drawItems(vm, container, ctx, vert) {
    if (vm.itemRadius <= 0 || !container.items || container.items.length <= 0) {
      return;
    }
    ctx.save();
    ctx.strokeStle = vm.itemBorderColor;
    ctx.fillStyle = vm.itemBackgroundColor;
    // jitter based on random data
    // use the datesetindex and index to initialize the random number generator
    const random = rnd(this._datasetIndex * 1000 + this._index);

    if (vert) {
      container.items.forEach((v) => {
        Chart.canvasHelpers.drawPoint(ctx, vm.itemStyle, vm.itemRadius, vm.x - vm.width / 2 + random() * vm.width, v);
      });
    } else {
      container.items.forEach((v) => {
        Chart.canvasHelpers.drawPoint(ctx, vm.itemStyle, vm.itemRadius, v, vm.y - vm.height / 2 + random() * vm.height);
      });
    }
    ctx.restore();
  },
  _drawOutliers(vm, container, ctx, vert) {
    if (vm.outlierRadius <= 0 || !container.outliers || container.outliers.length === 0) {
      return;
    }
    ctx.fillStyle = vm.outlierColor;
    ctx.beginPath();
    if (vert) {
      container.outliers.forEach((v) => {
        ctx.arc(vm.x, v, vm.outlierRadius, 0, Math.PI * 2);
      });
    } else {
      container.outliers.forEach((v) => {
        ctx.arc(v, vm.y, vm.outlierRadius, 0, Math.PI * 2);
      });
    }
    ctx.fill();
    ctx.closePath();
  },

  _getBounds() {
    // abstract
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
  },
  _getHitBounds() {
    const padding = this._view.hitPadding;
    const b = this._getBounds();
    return {
      left: b.left - padding,
      top: b.top - padding,
      right: b.right + padding,
      bottom: b.bottom + padding
    };
  },
  height() {
    return 0; // abstract
  },
  inRange(mouseX, mouseY) {
    if (!this._view) {
      return false;
    }
    return this._boxInRange(mouseX, mouseY) || this._outlierIndexInRange(mouseX, mouseY) >= 0 || this.itemInRange(mouseX, mouseY) !== false;
  },
  inLabelRange(mouseX, mouseY) {
    if (!this._view) {
      return false;
    }
    const bounds = this._getHitBounds();
    if (this.isVertical()) {
      return mouseX >= bounds.left && mouseX <= bounds.right;
    }
    return mouseY >= bounds.top && mouseY <= bounds.bottom;
  },
  inXRange(mouseX) {
    const bounds = this._getHitBounds();
    return mouseX >= bounds.left && mouseX <= bounds.right;
  },
  inYRange(mouseY) {
    const bounds = this._getHitBounds();
    return mouseY >= bounds.top && mouseY <= bounds.bottom;
  },
  _outlierIndexInRange(mouseX, mouseY) {
    const vm = this._view;
    const hitRadius = vm.outlierHitRadius;
    const outliers = this._getOutliers();
    const vertical = this.isVertical();

    // check if along the outlier line
    if ((vertical && Math.abs(mouseX - vm.x) > hitRadius) || (!vertical && Math.abs(mouseY - vm.y) > hitRadius)) {
      return -1;
    }
    const toCompare = vertical ? mouseY : mouseX;
    for (let i = 0; i < outliers.length; i++) {
      if (Math.abs(outliers[i] - toCompare) <= hitRadius) {
        return i;
      }
    }
    return -1;
  },
  outlierInRange(mouseX, mouseY) {
    const vm = this._view;
    const hitRadius = vm.outlierHitRadius;
    const outliers = this._getOutliers();
    const vertical = this.isVertical();

    // check if along the outlier line
    if ((vertical && Math.abs(mouseX - vm.x) > hitRadius) || (!vertical && Math.abs(mouseY - vm.y) > hitRadius)) {
      return false;
    }
    const toCompare = vertical ? mouseY : mouseX;
    for (let i = 0; i < outliers.length; i++) {
      if (Math.abs(outliers[i] - toCompare) <= hitRadius) {
        // const center = this.getCenterPoint();
        return {index: i, value: outliers[i], point: {x: vm.x, y: outliers[i]}};
      }
    }
    return false;
  },
  itemInRange(mouseX, mouseY) {
    const vm = this._view;
    const hitRadius = vm.outlierHitRadius;
    const items = this._getItems();
    const vertical = this.isVertical();

    // check if along the outlier line
    if ((vertical && Math.abs(mouseX - vm.x) > vm.width) || (!vertical && Math.abs(mouseY - vm.y) > vm.height)) {
      return false;
    }

    const random = rnd(this._datasetIndex * 1000 + this._index);
    let points = [];
    if (vertical) {
      items.forEach((v) => {
        points.push({x: vm.x - vm.width / 2 + random() * vm.width, y: v});

      });
    } else {
      items.forEach((v) => {
        points.push({x: v, y: vm.y - vm.height / 2 + random() * vm.height});
      });
    }

    for (let i = 0; i < points.length; i++) {
      const dist = Math.sqrt(Math.pow(mouseX - points[i].x, 2) + Math.pow(mouseY - points[i].y, 2));
      if (dist <= hitRadius) {
        return {index: i, value: items[i], point: points[i]};
      }
    }
    return false;
  },
  _boxInRange(mouseX, mouseY) {
    const bounds = this._getHitBounds();
    return mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
  },
  getCenterPoint() {
    const {x, y} = this._view;
    return {x, y};
  },
  getArea() {
    return 0; // abstract
  },
  _getOutliers() {
    return []; // abstract
  },
  _getItems() {
    return []; // abstract
  },
  _getPoints() {
    return []; // abstract
  },
  tooltipPosition(eventPosition, tooltip) {
    if (!eventPosition) {
      // fallback
      return this.getCenterPoint();
    }
    delete tooltip._tooltipOutlier;

    const vm = this._view;
    const index = this._outlierIndexInRange(eventPosition.x, eventPosition.y);
    if (index < 0) {
      return this.getCenterPoint();
    }
    tooltip._tooltipOutlier = index;
    if (this.isVertical()) {
      return {
        x: vm.x,
        y: this._getOutliers()[index]
      };
    }
    return {
      x: this._getOutliers()[index],
      y: vm.y,
    };
  }
});

export default ArrayElementBase;
