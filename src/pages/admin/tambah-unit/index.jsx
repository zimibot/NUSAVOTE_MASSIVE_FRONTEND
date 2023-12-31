import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useLocation } from 'react-router-dom';
import { ButtonBorder } from '../../../component/elements/button-border';
import Joi from 'joi';
import instance from '../../../middleware/api';
import Swal from 'sweetalert2'

function TambahUnit() {
  const location = useLocation()

  const id = location.pathname.split("/")[6]?.split("_")[0]
  const idEdit = location.pathname.split("/")[6]?.split("_")[1]
  const name = location.pathname.split("/")[5]
  const type = location.pathname.split("/")[4]
  const [formValues, setFormValues] = useState({
    unit: '',
    description: '',
    guidebook: ''
  });
  const [errors, setErrors] = useState({});

  const schema = Joi.object({
    unit: Joi.string().required().label('Unit'),
    description: Joi.string().required().label('Deskripsi'),
    guidebook: Joi.string().required().label('Buku Panduan')
  });

  const validate = () => {
    const { error } = schema.validate(formValues, { abortEarly: false });
    if (!error) return null;

    const errors = {};
    for (let item of error.details)
      errors[item.path[0]] = item.message;
    return errors;
  };

  useEffect(() => {
    if (type === "edit") {
      instance.get(`/admin/unit/id?id=${id}`).then(d => {

        setFormValues({
          unit: d.data.items.unit,
          description: d.data.items.description,
          guidebook: d.data.items.guidebook,
        })
      })
    }
  }, [])

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      const errors = validate();

      console.log(errors)
      setErrors(errors || {});
      if (errors) return;

      // Handle form submission logic here

      let value = type === "add" ? {
        ...formValues,
        category_id: id
      } : {
        ...formValues,
        id: id
      }

      let pos = type === "add" ? await instance.post("/admin/unit/create", value) : await instance.put("/admin/unit/edit", value)
      if (pos.status === 201) {
        Swal.fire({
          title: "BERHASIL",
          icon: "success",
          text: "Berhasil Menambahkan Unit",
          didClose: () => {
            window.location.href = `/admin/halamankategori/${name}/${id}`
          }
        })
      }

      if (pos.status === 200) {
        Swal.fire({
          title: "BERHASIL",
          icon: "success",
          text: "Berhasil Edit Unit",
          didClose: () => {
            window.location.href = `/admin/halamankategori/${name}/${idEdit}`
          }
        })
      }
      console.log(pos)
    } catch (error) {
      Swal.fire({
        title: "ERROR!!",
        icon: "error",
        text: error?.response?.data?.message
      })
      console.log(error)
    }

  };

  const handleChange = ({ target }) => {
    const newData = { ...formValues };
    newData[target.name] = target.value;
    setFormValues(newData);

  };
  return (
    <>
      <div className='card flex flex-col bg-white mt-4 pb-4'>
        <div className='header-card w-full h-16 bg-red-700 text-white rounded-t-lg'>
          <div className="ml-4 mt-4">{type === "add" ? "Tambahkan" : "Edit"} Unit</div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-4 container py-6 gap-6">
          <div className="col-span-1 flex items-center">
            <div>Unit</div>
          </div>
          <div className="col-span-3">
            <TextField
              fullWidth
              name="unit"
              value={formValues.unit}
              onChange={handleChange}
              error={Boolean(errors.unit)}
              helperText={errors.unit}
            />
          </div>

          <div className="col-span-1 flex items-center">
            <div>Deskripsi</div>
          </div>
          <div className="col-span-3">
            <TextField
              fullWidth
              name="description"
              value={formValues.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
          </div>

          <div className="col-span-1 flex items-center">
            <div>Buku Panduan</div>
          </div>
          <div className="col-span-3">
            <textarea
              className="w-full border min-h-[100px] p-4"
              name="guidebook"
              value={formValues.guidebook}
              onChange={handleChange}
            ></textarea>
            {errors.guidebook && <div className="text-red-500 text-xs">{errors.guidebook}</div>}
          </div>

          <div className="mt-4 flex items-center justify-center col-span-4">
            <ButtonBorder type="submit">Simpan</ButtonBorder>
          </div>
        </form>
      </div>
    </>
  )
}

export default TambahUnit;
