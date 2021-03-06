const required = "Bidang ini harus diisi !";
const minLength = "Nama minimal harus memiliki panjang 3 kata !";

$.validator.addMethod(
  "regex",
  function (value, element, regexp) {
    const re = new RegExp(regexp);
    return this.optional(element) || re.test(value);
  },
  "Please check your input."
);

$(function () {
  $("#gambarPaslon").on("change", function () {
    const fileName = $(this).val().replace(/^.*\\/, "");
    $(this).next(".custom-file-label").html(fileName);
  });

  $("#paslon-add").validate({
    rules: {
      nameKetua: {
        required: true,
        minlength: 3,
        regex: /^[a-zA-Z\s\-]+$/,
      },
      nameWaketu: {
        required: true,
        minlength: 3,
        regex: /^[a-zA-Z\s\-]+$/,
      },
      gambarPaslon: {
        required: true,
      },
    },
    messages: {
      nameKetua: {
        required,
        regex: "Nama harus berupa huruf kecil atau kapital !",
      },
      nameWaketu: {
        required,
        minlength: "Nama minimal memiliki panjang 3 karakter !",
        regex: "Nama harus berupa huruf kecil atau kapital !",
      },
      gambarPaslon: {
        required: "Pilih gambar terlebih dahulu !",
      },
    },
    submitHandler: function (form) {
      form.submit();
    },
    errorPlacement: function (label, element) {
      label.addClass("invalid-feedback");
      label.insertAfter(element);
    },
  });
});
