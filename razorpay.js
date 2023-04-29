// helper function

export const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Main function api request

  const handleSubmit = async (values, { resetForm }) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return false;
    }

    // creating a new order
    const { data } = await API.post("/student_razorpay", values);
    if (!data) {
      alert();
    //   toast.error("Server error. Are you online?", toast_options);
      return false;
    }

    if (data.status === true) {
      const { key, amount, currency, order_id } = data.data;

      // Getting the order details back
      const options = {
        key: key, // Enter the Key ID generated from the Dashboard
        amount: amount.toString(),
        currency: currency,
        name: "Arena",
        description: "Wallet Load",
        image: "Logo",
        order_id: order_id,
        handler: async (response) => {
          const { data } = await API.post("/student_verify", response);
          if (data.status) {
            console.log(data.message);
            resetForm();
            return true;
          } else {
            console.log("error");
            return false;
          }
        },
        prefill: {
          name: values.name,
          email: values.email,
          contact: values.mobile,
        },
        theme: {
          color: "#61dafb",
        },
        modal: {
          ondismiss: function () {
            console.error("Payment Window Closed.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        console.error(response.error.description);
      });

      paymentObject.open();
    } else {
      console.error("There is some error.");
      return false;
    }
  };

