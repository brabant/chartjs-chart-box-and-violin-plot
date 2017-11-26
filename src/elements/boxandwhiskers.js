﻿'use strict';

function isVertical(bar) {
    return bar._view.width !== undefined;
}

/**
 * Helper function to get the bounds of the box and whiskers
 * @private
 * @param elem {Chart.Element.BoxAndWhiskers} the bar
 * @return {{left, top, right, bottom}} bounds of the bar
 */
function getBounds(elem) {
    const vm = elem._view;

    const vert = isVertical(elem);
    const boxplot = vm.boxplot;

    if (vert) {
        const {x, width} = vm;
        const x0 = x - width / 2;
        return {
            left: x0,
            top: boxplot.whiskerMax,
            right: x0 + width,
            bottom: boxplot.whiskerMin
        };
    } else {
        const {y, height} = vm;
        const y0 = y - height / 2;
        return {
            left: boxplot.whiskerMin,
            top: y0,
            right: boxplot.whiskerMax,
            bottom: y0 + height
        };
    }
}

module.exports = function (Chart) {
    Chart.defaults.global.elements.boxandwhiskers = Object.assign({}, Chart.defaults.global.elements.rectangle, {
        borderWidth: 1,
        outlierRadius: 2
    });

    Chart.elements.BoxAndWhiskers = Chart.Element.extend({
        draw() {
            const ctx = this._chart.ctx;
            const vm = this._view;

            ctx.fillStyle = vm.backgroundColor;
            ctx.strokeStyle = vm.borderColor;
            ctx.lineWidth = vm.borderWidth;

            const boxplot = vm.boxplot;
            const vert = isVertical(this);

            ctx.beginPath();
            if (vert) {
                const {x, width} = vm;
                const x0 = x - width / 2;
                ctx.fillRect(x0, boxplot.q1, width, boxplot.q3 - boxplot.q1);
                ctx.strokeRect(x0, boxplot.q1, width, boxplot.q3 - boxplot.q1);
                ctx.moveTo(x0, boxplot.whiskerMin);
                ctx.lineTo(x0 + width, boxplot.whiskerMin);
                ctx.moveTo(x, boxplot.whiskerMin);
                ctx.lineTo(x, boxplot.q1);
                ctx.moveTo(x0, boxplot.whiskerMax);
                ctx.lineTo(x0 + width, boxplot.whiskerMax);
                ctx.moveTo(x, boxplot.whiskerMax);
                ctx.lineTo(x, boxplot.q3);
                ctx.moveTo(x0, boxplot.median);
                ctx.lineTo(x0 + width, boxplot.median);
            } else {
                const {y, height} = vm;
                const y0 = y - height / 2;
                ctx.fillRect(boxplot.q1, y0, boxplot.q3 - boxplot.q1, height);
                ctx.strokeRect(boxplot.q1, y0, boxplot.q3 - boxplot.q1, height);

                ctx.moveTo(boxplot.whiskerMin, y0);
                ctx.lineTo(boxplot.whiskerMin, y0 + height);
                ctx.moveTo(boxplot.whiskerMin, y);
                ctx.lineTo(boxplot.q1, y);
                ctx.moveTo(boxplot.whiskerMax, y0);
                ctx.lineTo(boxplot.whiskerMax, y0 + height);
                ctx.moveTo(boxplot.whiskerMax, y);
                ctx.lineTo(boxplot.q3, y);
                ctx.moveTo(boxplot.median, y0);
                ctx.lineTo(boxplot.median, y0 + height);
            }
            ctx.stroke();
            ctx.closePath();

            const outlierRadius = vm.outlierRadius;
            if (boxplot.outliers) {
                ctx.beginPath();
                if (vert) {
                    const x = vm.x;
                    boxplot.outliers.forEach((v) => {
                        ctx.arc(x, v, outlierRadius, 0, Math.PI * 2);
                    });
                } else {
                    const y = vm.y;
                    boxplot.outliers.forEach((v) => {
                        ctx.arc(v, y, outlierRadius, 0, Math.PI * 2);
                    });
                }
                ctx.fill();
                ctx.closePath();
            }

        },
        height() {
            const vm = this._view;
            return vm.base - Math.min(vm.boxplot.q1, vm.boxplot.q3);
        },
        inRange(mouseX, mouseY) {
            if (!this._view) {
                return false;
            }
            const bounds = getBounds(this);
            return mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
        },
        inLabelRange(mouseX, mouseY) {
            if (!this._view) {
                return false;
            }
            const bounds = getBounds(this);
            if (isVertical(this)) {
                return mouseX >= bounds.left && mouseX <= bounds.right;
            } else {
                return mouseY >= bounds.top && mouseY <= bounds.bottom;
            }
        },
        inXRange(mouseX) {
            const bounds = getBounds(this);
            return mouseX >= bounds.left && mouseX <= bounds.right;
        },
        inYRange(mouseY) {
            const bounds = getBounds(this);
            return mouseY >= bounds.top && mouseY <= bounds.bottom;
        },
        getCenterPoint() {
            const vm = this._view;
            const {x, y, boxplot} = vm;

            if (isVertical(this)) {
                return {x, y: boxplot.median};
            } else {
                return {x: boxplot.median, y};
            }
        },
        getArea() {
            const vm = this._view;
            const iqr = Math.abs(vm.boxplot.q3 - vm.boxplot.q1);
            if (isVertical(this)) {
                return iqr * vm.width;
            } else {
                return iqr * vm.height;
            }
        },

        tooltipPosition_ () {
            return this.getCenterPoint();
        }
    });

};

