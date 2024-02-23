import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})

export class TableComponent implements OnInit, OnChanges{

  isResizing: boolean = false;
  @Input() dataSource!: MatTableDataSource<any[]>;
  @Input() configuration: any;
  @Input() allowColumnResize:boolean = true;
  @Output() callbackButton = new EventEmitter<any>();
  @Output() downloadButton = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  hoverColumn:any = null;
  tableId:any = null;
  exporting: boolean = false;
  filters:any[] = []
  filterText:any = {};

  get displayedColumns(){
    return this.configuration.columns.filter((x: any) => this.showColumn(x)).map((x: any) => x.data)
  }

  constructor(
  ) { }

  passFilter(data: any){
    let _return = false
    for(let column of this.configuration?.columns){
      if (this.filterText[column.data]){
        let prep = this.prepareText(data, column)
        if(prep){
          if (prep.toString().trim().toLowerCase().includes(this.filterText[column.data].trim().toLowerCase())){
            _return = true
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        _return = true
      }
    }
    return _return
  }

  applyFilter(){
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return this.passFilter(data);
    };
    this.dataSource.filter = " ";
  }

  setFilter(column: any){
    this.filterText[column.data] = null
    if (this.inFilter(column)){
      this.filters = this.filters.filter(x => x.column != column)
      this.applyFilter()
      return
    }
    this.filters = this.filters.filter(x => x.column != column)
    this.filters.push({
      column: column
    })
  }

  inFilter(column: any){
    return this.filters.filter(x => x.column == column).length > 0
  }

  setSort(column: any){
    document.getElementById("sort" + column?.data)?.click();
    // if(!this.dataSource?.data || !this.sort) return;
    // this.dataSource.sortingDataAccessor = (item, property: any) => {
    //   let value = this.prepareText(item, column)
    //   if (column?.dataType == 'date' && value){
    //     var _date = value.split(' ')
    //     value = _date[0].split('/')
    //     value = value[2] + '-' + value[1] + '-' + value[0]
    //     if (_date.length > 1){
    //       value = value + ' ' + _date[1]
    //     }
    //   }
    //   return value
    // };
    // this.dataSource.sort = this.sort;
  }

  newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  showColumn(column:any, expectedType:any=null){
    let _pass = true
    if (column?.hide === true){
      _pass = false
    }
    if (expectedType && expectedType != column?.type && !(expectedType == 'text' && !column?.type)){
      _pass = false
    }
    if (column?.showInExport === false && this.exporting){
      _pass = false
    }
    return _pass
  }

  clickCell(element: any, column: any){
    this.callbackButton.emit({
      type: 'cell',
      element: element,
      column: column
    });
  }

  clickButton(button: any, element: any) {
    this.callbackButton.emit({
      button: button,
      element: element
    });
  }

  hoverTable(column:any){
    this.hoverColumn = column
  }

  get showFooter(){
    if (!this.dataSource?.data?.length || this.dataSource?.data?.length == 0)
      return false;
    return this.configuration?.columns.filter(
      (x:any) => x?.footer
      && (x?.footer?.text || x?.footer?.sum)
    ).length > 0
  }

  prepareFooter(column:any){
    let footer = column?.footer
    let text = footer?.text
    if (footer?.sum){
      text = 0
      for(let x of this.dataSource.data)
        if(x[footer.sum]) text = text + x[footer.sum]
    }

    if(text && footer?.pipe){
      if (footer?.pipeParameters){
        text = footer?.pipe.transform(text, footer?.pipeParameters)
      } else {
        text = footer?.pipe.transform(text)
      }
    }

    return text;
  }

  getJustify(justify:any){
    if (!justify) return null;
    return 'justify-content-' + justify
  }

  getColspan(column:any){
    if(this.exporting) return 1;
    let ignore = 0;
    for(var c of this.configuration.columns){
      if (!c?.footer){
        c.footer = {
          colspan: 1
        }
      }
      if (ignore > 0){
        c.footer.colspan = 0
        ignore--;
      }
      if (c.footer.colspan > 0){
        ignore = ignore + c.footer.colspan - 1
      }
      if (c == column){
        break
      }
    }
    return column.footer.colspan
  }

  toMoney2(valor: number, decimal: number = 2, prefix: string = ''){
    if(!valor) return valor;
    var number = valor.toFixed(decimal).split('.');
    number[0] = number[0].split(/(?=(?:...)*$)/).join('.');
    return prefix + number.join(',').replace('-.', '-')
  }

  toMoney(value: any){
    return this.toMoney2(value, 2, 'R$ ')
  }

  prepareText(element:any, column:any){
    let text = element
    for(let x of column.data.split('.')){
      if (text){
        text = text[x]
      }
    }

    if (column?.sum){
      text = 0
      for(let x of column.sum)
        if(element[x]) text = text + element[x]
      element[column.data] = text
    }

    if (column?.subtract){
      text = null
      for(let x of column.subtract){
        if(element[x]){
          if (!text){
            text = element[x]
          } else {
            text = text - element[x]
          }
        }
      }
      element[column.data] = text
      return text
    }

    if(text && column?.pipe){
      if (column?.pipeParameters){
        text = column?.pipe.transform(text, column?.pipeParameters)
      } else {
        text = column?.pipe.transform(text)
      }
    }
    return text
  }

  async setPaginator(){
    if(this.paginator){
      this.paginator._intl.itemsPerPageLabel="Itens por página";
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.tableId = this.newGuid();
    this.setPaginator()
  }

  ngOnChanges(changes:any) {
    if(changes?.dataSource){
      this.setPaginator()
    }
  }

  Export(){
    this.ExportTableToExcel()
  }

  MatTableToExcel(excelFileName: string = 'tabela'){
    let objetos = []
    for(let data of this.dataSource.filteredData){
      let objeto:any = {}
      for (let column of this.configuration?.columns){
        if (data[column.data]){
          objeto[column.title] = data[column.data]
        }
      }
      objetos.push(objeto)
    }
    this.ExportJsonToExcel(objetos, excelFileName)
  }

  ExportJsonToExcel(json: any[], excelFileName: string = 'tabela'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async ExportTableToExcel(excelFileName: string = 'tabela', sheetName: string = 'Tabela'): Promise<void> {
    this.exporting = true;
    let _pageSize = this.paginator.pageSize
    this.paginator._changePageSize(this.paginator.length);
    await this.delay(1);
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById(this.tableId), {raw:true});
    this.paginator._changePageSize(_pageSize);
    this.exporting = false;
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
      const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
      FileSaver.saveAs(data, fileName + '_' + new  Date().getTime() + EXCEL_EXTENSION);
  }

  private paddingDiff(col: any): number {
    if (this.getStyleVal(col, 'box-sizing') == 'border-box') {
      return 0;
    }

    var padLeft = this.getStyleVal(col, 'padding-left');
    var padRight = this.getStyleVal(col, 'padding-right');
    return (parseInt(padLeft) + parseInt(padRight));
  }

  private getStyleVal(elm: any, css: any): string {
    return window.getComputedStyle(elm, null).getPropertyValue(css);
  }

  OnResizerMouseDown(e: any, column:any) {
    if (!this.allowColumnResize || this.isResizing) return;
    this.isResizing = true;

    var pageX = e.pageX;
    var curCol = e.target.closest("th");
    var padding = this.paddingDiff(curCol);
    var new_width = curCol.offsetWidth - padding;

    var onMouseMoveCallback = (e: any) => {
      if (curCol) {
        curCol.style.width = (new_width + (e.pageX - pageX)) + 'px';
      }
    };

    var onMouseUpCallback = (e: any) => {
      curCol = undefined;
      pageX = undefined;
      setTimeout(() => {
        this.isResizing = false;
      });

      document.removeEventListener("mousemove", onMouseMoveCallback);
      document.removeEventListener("mouseup", onMouseUpCallback);
    };
    document.addEventListener("mousemove", onMouseMoveCallback);
    document.addEventListener("mouseup", onMouseUpCallback);
  }
}
