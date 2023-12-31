import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { ILocale } from 'app/shared/model/locale.model';
import { getEntities as getLocales } from 'app/entities/locale/locale.reducer';
import { IBoitier } from 'app/shared/model/boitier.model';
import { getEntities as getBoitiers } from 'app/entities/boitier/boitier.reducer';
import { ILocaleBoitier } from 'app/shared/model/locale-boitier.model';
import { getEntity,getEntities, updateEntity, createEntity, reset } from './locale-boitier.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { Translate, TextFormat } from 'react-jhipster';
import { IBatiment } from 'app/shared/model/batiment.model';
import { getEntities as getBatiments } from 'app/entities/batiment/batiment.reducer';
import { getEntities as getEtages, getEntity as getEtage  } from 'app/entities/etage/etage.reducer';

export const LocaleBoitierUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const locales = useAppSelector(state => state.locale.entities);
  const boitiers = useAppSelector(state => state.boitier.entities);
  const batiments = useAppSelector(state => state.batiment.entities);
  const etages = useAppSelector(state => state.etage.entities);
  const localeBoitierList = useAppSelector(state => state.localeBoitier.entities);
  const localeBoitierEntity = useAppSelector(state => state.localeBoitier.entity);
  const loading = useAppSelector(state => state.localeBoitier.loading);
  const updating = useAppSelector(state => state.localeBoitier.updating);
  const updateSuccess = useAppSelector(state => state.localeBoitier.updateSuccess);

  const [selectedLocale, setSelectedLocale] = useState(null);
  const [selectedBatimentState, setSelectedBatiment] = useState(null);
  const [selectedEtage, setSelectedEtage] = useState(null);
  const [selectedBoitier, setSelectedBoitier] = useState(null);
  const [localeDisabled, setLocaleDisabled] = useState(false);
  const [buildingDisabled, setBuildingDisabled] = useState(false);
  const [etageDisabled, setEtageDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tableData, setTableData] = useState([]);
  const [filteredLocalesState, setFilteredLocales] = useState([]);
  const [filteredEtages, setFilteredEtages] = useState([]);
  const [localeBoitierHistoryState, setLocaleBoitierHistory] = useState([]);
  const [etagesDisponibles, setEtagesDisponibles] = useState([]);


  
  const handleClose = () => {
    navigate('/locale');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getLocales({}));
    dispatch(getBoitiers({}));
    dispatch(getEntities({}));
    dispatch(getBatiments({}));
    dispatch(getEtages({}));
  }, []);

  

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);


  const [formData, setFormData] = useState({
    // Initialize with default values if needed
    batiment:'',
    locale:'',
    etage:'',
    boitier: '',
    dateDebut: '',
    dateFin: '',
  });
  const handleAddRow = () => {
    if (selectedLocale) {
      const newRow = { ...formData, locale: selectedLocale };
      const exists = tableData.some(
        (data) => data.boitier === newRow.boitier && data.locale === newRow.locale
      );
      if (!exists) {
      setTableData([...tableData, newRow]);
      setErrorMessage('');
      setFormData({
        ...formData,
        etage : '',
        locale:'',
        boitier: '',
        dateDebut: currentDate,
        dateFin: '',
      });
    } else {
      setErrorMessage('You have already chosen this Box. Please select a different one.');
    }
    }
  };

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };
  
  
  const handleInputChange =  (e) =>{
    const { name, value } = e.target;
    if(name === 'batiment'){
      const selectedBatimentId = parseInt(value, 10);
      const selectedBatiment = batiments.find(
        (batiment) => batiment.id === selectedBatimentId
      );
  
      const options = [];
      for (let i = 0; i <= (selectedBatiment ? selectedBatiment.nbrEtage : 0); i++) {
        options.push({
          value: i,
          label: i === 0 ? 'Ground floor' : `Floor ${i}`,
        });
      }
  
      setEtagesDisponibles(options);
  
      setSelectedBatiment(value);
      setBuildingDisabled(true);
      setLocaleDisabled(false);
  
    }else if(name ==='etage'){
      setSelectedEtage(value);
    const selectedEtageId = parseInt(value, 10);

    const filteredLocales = locales.filter(
      (locale) => locale.numeroEtage === selectedEtageId
    );

    setFilteredLocales(filteredLocales);
    setEtageDisabled(true);
    } else if (name === 'locale') {
      setSelectedLocale(value);
    const selectedLocalId = parseInt(value, 10);
    setLocaleDisabled(true);

    // Fetch localBoitierList based on the selected locale
    const localeBoitierHistory = localeBoitierList.filter(
      (item) => item.locale.id === selectedLocalId
    );

    setLocaleBoitierHistory(localeBoitierHistory);
    //console.log(localeBoitierHistory);

    } else if (name === 'boitier') {
      const currentDate = new Date();
      const selectedBoitierId = value;
  
      const boitierExistence = localeBoitierList.some((item) => {
        if (item.boitier && item.dateFin) {
          const dateFinBoitier = new Date(item.dateFin);
          return (
            item.boitier.id === selectedBoitierId &&
            currentDate.getTime() - dateFinBoitier.getTime() < 0
          );
        }
        return false;
      });
  
      if (boitierExistence) {
        setErrorMessage('Ce boitier n\'est pas encore disponible.');
      } else {
        setErrorMessage(''); // Réinitialiser le message d'erreur s'il est déjà présent
      }
    }
  
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const mapBoitierRef = (boitierId) => {
    const boitier = boitiers.find((entity) => entity.id.toString() === boitierId.toString());
    return boitier ? boitier.boitierReference : '';
  };
  
  
  
  
  


  const saveEntity = values => {
    const entity = {
      ...localeBoitierEntity,
      ...values,
      locale: locales.find(it => it.id.toString() === values.locale.toString()),
      boitier: boitiers.find(it => it.id.toString() === values.boitier.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...localeBoitierEntity,
          locale: localeBoitierEntity?.locale?.id,
          boitier: localeBoitierEntity?.boitier?.id,
        };

  const removeRow = (index) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  const resetForm = () => {
    setFormData({
        batiment:'',
        etage : '',
        locale:'',
        boitier: '',
        dateDebut: currentDate,
        dateFin: '',
    }); // Reset the remainingBranches field
    setLocaleDisabled(false);
  };

  const handleSubmitAllRows = () => {
    tableData.forEach((row) => {
      const values = {
        boitier: row.boitier,
        locale: row.locale,
        dateDebut: currentDate,
        dateFin: row.dateFin,
      };
      saveEntity(values);
    });
    setTableData([]); // Clear the table after submission
    resetForm(); // Reset the form fields
  };
  const currentDate = new Date().toISOString().split('T')[0];
  
  const mapBoitierType = (boitierId) => {
    const boitier = boitiers.find((entity) => entity.id.toString() === boitierId.toString());
    return boitier ? boitier.boitierReference : '';
  };

  

  return (
    <div className="page-container">
    <div className="container-right" >
          <h3 id="feOptimisationEnergieApp.capteurBoitier.home.createOrEditLabel" data-cy="CapteurBoitierCreateUpdateHeading">
          Assign Box to Local
          </h3>
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="locale-boitier-id" label="ID" onChange={handleInputChange} validate={{ required: true }} />
              ) : null}
              <ValidatedField id="locale-boitier-locale" name="batiment" data-cy="batiment" label="Building Name" type="select" disabled={buildingDisabled} onChange={handleInputChange}>
                <option value="" key="0" />
                {batiments
                  ? batiments.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.batimentNom}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                  id="locale-boitier-locale"
                  name="etage"
                  data-cy="etage"
                  label="Floor number"
                  type="select"
                  disabled={etageDisabled}
                  onChange={handleInputChange}
                  value={selectedEtage} // assuming 'selectedEtage' is a state variable to manage the selected floor
                >
                  <option value="" key="0" />
                  {etagesDisponibles.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </ValidatedField>

              <ValidatedField id="locale-boitier-locale" name="locale" data-cy="locale" label="Local number" type="select" disabled={localeDisabled} onChange={handleInputChange}>
              <option value="" key="0" />
              {filteredLocalesState
                ? filteredLocalesState.map((otherEntity) => (
                    <option value={otherEntity.numero} key={otherEntity.id}>
                      {`N°${otherEntity.numero}`}
                    </option>
                  ))
                : null}
              </ValidatedField>
              <ValidatedField id="locale-boitier-boitier" name="boitier" data-cy="boitier" label="Box reference" type="select" onChange={handleInputChange} value={formData.boitier}>
                <option value="" key="0" />
                {boitiers
                  ? boitiers.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.boitierReference}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              <ValidatedField label="First date" id="locale-boitier-dateDebut" name="dateDebut" data-cy="dateDebut" type="date" value={currentDate} // Set the value to the current date
                onChange={handleInputChange}  disabled />
              <ValidatedField label="Last date" id="locale-boitier-dateFin" name="dateFin" data-cy="dateFin" type="date" onChange={handleInputChange} value={formData.dateFin}/>
              
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/locale-boitier" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" 
              disabled={updating} onClick={handleAddRow}
              style={{ marginRight: '10px' }}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Add
              </Button>
              <Button
              color="primary"
              id="submit-all-rows"
              data-cy="submitAllRowsButton"
              replace
              type="button"
              onClick={handleSubmitAllRows}
              disabled={updating || tableData.length === 0} // Disable the button if there are no rows in the table
              
            >
              Submit All
            </Button>

            </ValidatedForm>
          )}
        </Col>
      </div>
      <div className="container-left">
    <table className="responsive-table">
          <thead className="table-header">
            <tr>
              <th className="col col-1" style={{ textAlign: 'center' }}>Local</th>
              <th className="col col-1" style={{ textAlign: 'center' }}>Box</th>
              <th className="col col-1" style={{ textAlign: 'center' }}>First date</th>
              <th className="col col-1" style={{ textAlign: 'center' }}>Last date</th>
              <th className="col col-1" style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
          {tableData.map((rowData, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{rowData.locale}</td>
                <td style={{ textAlign: 'center' }}>{mapBoitierType(rowData.boitier)}</td>
                <td style={{ textAlign: 'center' }}>
                 <TextFormat type="date" value={currentDate} format={APP_LOCAL_DATE_FORMAT} /> 
                </td>
                <td style={{ textAlign: 'center' }} >
                {rowData.dateFin ? <TextFormat type="date" value={rowData.dateFin} format={APP_LOCAL_DATE_FORMAT} /> : null}
                </td>
                <td style={{ textAlign: 'center' }}><button className="btn btn-danger btn-sm" onClick={() => removeRow(index)}>Remove</button></td>
              </tr>
            ))}
            {localeBoitierHistoryState.map((localeBoitier, i) => (
            <tr key={`history-${i}`}>
              {/* Render historical data columns */}
              <td style={{ textAlign: 'center' }}>{localeBoitier.locale.id}</td>
              <td style={{ textAlign: 'center' }}>{localeBoitier.boitier.boitierReference}</td>
              <td style={{ textAlign: 'center' }}>
                <TextFormat type="date" value={localeBoitier.dateDebut} format={APP_LOCAL_DATE_FORMAT} />
              </td>
              <td style={{ textAlign: 'center' }}>
                {localeBoitier.dateFin ? (
                  <TextFormat type="date" value={localeBoitier.dateFin} format={APP_LOCAL_DATE_FORMAT} />
                ) : null}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}

          </tbody>
        </table>

  </div>
    </div>
  );
};

export default LocaleBoitierUpdate;
