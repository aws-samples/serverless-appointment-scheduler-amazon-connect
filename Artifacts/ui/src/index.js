import React, { Component, forwardRef } from "react";
import ReactDOM from "react-dom";
import MaterialTable from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import "./index.css";
import axios from "axios";
import doneIcon from "./icon_done.png";
import {
  Inject,
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  EventSettingsModel,
  Resize,
  DragAndDrop
} from "@syncfusion/ej2-react-schedule";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import autoBind from "react-autobind";
import moment from "moment";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

class App extends Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      data: [],
      listView: true
    };
  }

  toListView() {
    this.setState({
      listView: true
    });
  }

  toCalendarView() {
    this.setState({
      listView: false
    });
  }

  change(args) {
    this.scheduleObj.selectedDate = args.value;
    this.scheduleObj.dataBind();
  }

  componentDidMount() {
    this.getData().then(result =>
      this.setState({
        data: result.Items
      })
    );
  }

  getData() {
    return new Promise((resolve, reject) => {
      let url =
        "https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/ddb";
      fetch(url)
        .then(response => response.json())
        .then(result => {
          resolve(result);
        });
    });
  }

  dataMapper(rawData) {
    return rawData.map(each => {
      console.log("#####", each);
      let startDate = new Date(each.date.S + " " + each.timeslot.S);
      let endDate = new Date(each.date.S + " " + each.timeslot.S);
      return {
        Subject: each.fname ? each.fname.S : "",
        StartTime: startDate,
        EndTime: new Date(endDate.setHours(endDate.getHours() + 1)),
        Phone: each.phone ? each.phone.S : null,
        Status: each.meeting ? each.meeting.S : null,
        Notes: each.notes ? each.notes.S : null
      };
    });
  }

  contentTemplate(props) {
    return (
      <div>
        {props.elementType === "cell" ? null : (
          <div className="e-event-content">
            <div className="e-subject-wrap">
              <div className="info">
                {props.StartTime !== undefined ? (
                  <div className="timeslot">
                    Timeslot:{" "}
                    {moment(props.StartTime).format("YYYY-MM-DD, hh:mm")}
                  </div>
                ) : (
                  ""
                )}
                {props.Phone ? (
                  <div className="phone">Phone: {props.Phone}</div>
                ) : (
                  ""
                )}
                {props.Status ? (
                  <div className="phone">Status: {props.Status}</div>
                ) : (
                  ""
                )}
                {props.Notes ? (
                  <div className="phone">Notes: {props.Notes}</div>
                ) : (
                  ""
                )}
              </div>
              <div className="image">
                <button
                  onClick={() => {
                    const params = {
                      CustomerNumber: props.Phone,
                      FirstName: props.Subject
                    };
                    const call = axios.post(
                      `https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/outcall`,
                      params
                    );
                    console.log(`name.S`, params);
                    window.open(
                      "https://<your-instance-name>.awsapps.com/connect/ccp-v2/softphone",
                      "_blank",
                      "height=600,width=400"
                    );
                  }}
                  className="tooltip"
                >
                  <img
                    style={{ height: 45 }}
                    className="call_icon"
                    alt="call_icon"
                    src="icon_phone.png"
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  editorTemplate(props) {
    return (
      <div>
        <table
          className="custom-event-editor"
          style={{ width: "100%", cellpadding: "3" }}
        >
          <tbody>
            <tr>
              <td className="e-textlabel">Name</td>
              <td>
                <input
                  readOnly
                  className="e-field e-input non-clickable"
                  id="Name"
                  name="Subject"
                  style={{ border: "none" }}
                />
              </td>
            </tr>
            <tr>
              <td className="e-textlabel">Phone</td>
              {props.Phone ? (
                <td>
                  <input
                    readOnly
                    className="e-field e-input non-clickable"
                    id="Phone"
                    name="Phone"
                    style={{ border: "none" }}
                  />
                </td>
              ) : (
                ""
              )}
            </tr>
            <tr>
              <td className="e-textlabel">Time Slot</td>
              {props.StartTime ? (
                <td>
                    <input
                      readOnly
                      className="e-field e-input non-clickable"
                      id="StartTime"
                      name="StartTime"
                      style={{ border: "none", width: '155px'}}
                    />
                  {/*<DateTimePickerComponent*/}
                  {/*  format="dd/MM/yy hh:mm a"*/}
                  {/*  id="StartTime"*/}
                  {/*  data-name="StartTime"*/}
                  {/*  value={new Date(props.startTime || props.StartTime)}*/}
                  {/*  className="e-field"*/}
                  {/*/>*/}
                </td>
              ) : (
                ""
              )}
            </tr>
            <tr>
              <td className="e-textlabel">Status</td>
              <td colSpan={4}>
                <input
                  id="Status"
                  className="e-field e-input"
                  type="text"
                  name="Status"
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <td className="e-textlabel">Notes</td>
              <td colSpan={4}>
                <input
                  id="Notes"
                  className="e-field e-input"
                  type="text"
                  name="Notes"
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  onPopupClose(args) {
    console.log("this data", this.state.data);
    if (args.type === "Editor" && args.data) {
      console.log("!!!!!!", args.data);
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const raw = JSON.stringify({
        TableName: "AppointmentsTable",
        Key: {
          date: { S: moment(args.data.StartTime).format("YYYY-MM-DD") },
          timeslot: { S: moment(args.data.StartTime).format("hh:mm") }
        },
        UpdateExpression: "SET meeting = :meet, notes = :note",
        ExpressionAttributeValues: {
          ":meet": { S: args.data.Status },
          ":note": { S: args.data.Notes }
        }
      });

      let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch(
        "https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/done",
        requestOptions
      )
        .then(response => response.text())
        .then(result => {
          console.log(result);
          this.getData().then(result =>
            this.setState({
              data: result.Items
            })
          );
        })
        .catch(error => console.log("error", error));
    }
  }

  tableRef = React.createRef();
  render() {
    return (
      <div>
        <img
          src="<optional-add-logo-here"
          alt="icon"
          style={{
            height: 120
          }}
        />
        <div className="navigator">
          {this.state.listView ? (
            <div>
              <button className="button-clicked" onClick={this.toListView}>
                List View
              </button>
              <button
                className="button-not-clicked"
                onClick={this.toCalendarView}
              >
                Calendar View
              </button>
            </div>
          ) : (
            <div>
              <button className="button-not-clicked" onClick={this.toListView}>
                List View
              </button>
              <button className="button-clicked" onClick={this.toCalendarView}>
                Calendar View
              </button>
            </div>
          )}
        </div>
        {this.state.listView ? (
          <div>
            <div
              style={{
                maxWidth: "100%",
                paddingRight: "170px",
                paddingLeft: "170px"
              }}
            >
              <MaterialTable
                tableRef={this.tableRef}
                columns={[
                  { title: "Date", field: "date.S" },
                  { title: "TimeSlot", field: "timeslot.S" },
                  { title: "Name", field: "fname.S" },
                  { title: "Phone", field: "phone.S" }
                ]}
                actions={[
                  {
                    icon: () => (
                      <img
                        style={{ height: 45 }}
                        alt="call_icon"
                        className="call_icon"
                        src="https://freepngimg.com/download/web_design/44628-9-calling-image-free-clipart-hd.png"
                      />
                    ),
                    tooltip: "Click-to-Call",
                    title: "Call",
                    onClick: (event, rowData) => {
                      console.log(event, rowData);
                      const params = {
                        CustomerNumber: rowData.phone.S,
                        FirstName: rowData.fname.S
                      };
                      axios.post(
                        `https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/outcall`,
                        params
                      );
                      console.log(`name.S`, rowData.phone.S, rowData.fname.S);
                      window.open(
                        "https://<your-instance-name>.awsapps.com/connect/ccp-v2/softphone",
                        "_blank",
                        "height=600,width=400"
                      );
                    }
                  },
                  {
                    icon: () => (
                      <img
                        style={{ height: 55 }}
                        alt="done"
                        className="done"
                        src={doneIcon}
                      />
                    ),
                    tooltip: "Done",
                    onClick: (event, rowData) => {
                      //alert("Appointment Completed with " + rowData.fname.S);
                      var myHeaders = new Headers();
                      myHeaders.append("Content-Type", "application/json");
                      var raw = JSON.stringify({
                        TableName: "AppointmentsTable",
                        Key: {
                          date: { S: rowData.date.S },
                          timeslot: { S: rowData.timeslot.S }
                        }
                      });

                      var requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: raw,
                        redirect: "follow"
                      };

                      fetch(
                        "https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/done",
                        requestOptions
                      )
                        .then(response => response.text())
                        .then(result => console.log(result))
                        .catch(error => console.log("error", error));
                      // console.log(`date.S`, rowData.date.S, rowData.timeslot.S);
                      //window.location.reload(false);
                      //this.tableRef.current.onClick();
                    }
                  }
                ]}
                data={query =>
                  new Promise((resolve, reject) => {
                    let url =
                      "https://<your-api-ID>.execute-api.<region>.amazonaws.com/dev/ddb";
                    fetch(url)
                      .then(response => response.json())
                      .then(result => {
                        resolve({
                          data: result.Items,
                          totalCount: result.total
                        });
                      });
                  })
                }
                title="Scheduled Appointments"
                options={{
                  rowStyle: {
                    backgroundColor: "white"
                  },
                  headerStyle: {
                    backgroundColor: "#E60011",
                    color: "#FFF",
                    fontWeight: "bold"
                  },
                  actionsColumnIndex: -1,
                  pageSize: 10,
                  sorting: true,
                  sortOrder: true
                }}
                icons={tableIcons}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              maxWidth: "100%",
              paddingRight: "170px",
              paddingLeft: "170px"
            }}
          >
            <ScheduleComponent
              currentView="Month"
              ref={schedule => (this.scheduleObj = schedule)}
              eventSettings={{
                allowAdding: false,
                allowDeleting: false,
                allowEditing: true,
                dataSource: this.dataMapper(this.state.data)
              }}
              quickInfoTemplates={{ content: this.contentTemplate.bind(this) }}
              editorTemplate={this.editorTemplate.bind(this)}
              popupClose={this.onPopupClose.bind(this)}
            >
              <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
            </ScheduleComponent>
          </div>
        )}
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
// const rootElement = document.getElementById("root");
// ReactDOM.render(<App />, rootElement);
