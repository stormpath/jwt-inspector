import React from 'react';

export default class Table extends React.Component {
  onColumnClick(column, index) {
    if (this.props.onColumnClick) {
      this.props.onColumnClick(column, index);
    }
  }

  onRowClick(row, index) {
    if (this.props.onRowClick) {
      this.props.onRowClick(row, index);
    }
  }

  render() {
    let columns = this.props.columns.map((column, columnIndex) => {
      return (
        <th onClick={this.onColumnClick.bind(this, column, columnIndex)}>{column.title}</th>
      );
    });

    let rows = this.props.rows.map((row, rowIndex) => {
      let rowColumns = [];
      let isRowSelected = rowIndex === this.props.selectedRowIndex;

      row.data.forEach((column, columnIndex) => {
        rowColumns.push(
          <td>{column}</td>
        );
      });

      return (
        <tr className={isRowSelected ? 'selected' : ''} onClick={this.onRowClick.bind(this, row, rowIndex)} style={row.style}>
          {rowColumns}
        </tr>
      );
    });

    if (rows.length === 0) {
      rows.push(
        <tr className="no-data"><td colSpan={columns.length}>{this.props.emptyMessage || 'No data available.'}</td></tr>
      );
    }

    return (
      <table {...this.props}>
        <thead>
          <tr>
            {columns}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}
