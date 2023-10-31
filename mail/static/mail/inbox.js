document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function view_email(id,mailbox){
	// take 'get' email id api
	fetch(`/emails/${id}`)
	.then(response => response.json())
	.then(email => {
		// Print emails
		console.log(email);
		// show the details hide other views
		document.querySelector('#emails-view').style.display = 'none';
		document.querySelector('#compose-view').style.display = 'none';
		document.querySelector('#email-detail-view').style.display = 'block';
		
		document.querySelector('#email-detail-view').innerHTML = `
		<ul class="list-group">
          <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
          <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
          <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
          <li class="list-group-item"><strong>Timestamp:</strong>${email.timestamp}</li>
          <li class="list-group-item">${email.body}</li>
        </ul>
		`;
		// change to read
		if(email.read == false){
			fetch(`/emails/${email.id}`, {
			  method: 'PUT',
			  body: JSON.stringify({
				  read: true
			  })
			})			
		}
		// Archive/Unarchive logic
		if(mailbox !== 'sent'){
			const btn_arch = document.createElement('button');
			btn_arch.innerHTML = email.archived ? 'Unarchive' : 'Archive';
			btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger";
			btn_arch.addEventListener('click', function(){
				fetch(`emails/${email.id}`,{
					method: 'PUT',
					body: JSON.stringify({
						archived: !email.archived
					})
				})
				.then(() => {load_mailbox('archive')})	
			});
			document.querySelector('#email-detail-view').append(btn_arch);
		}
		// reply logic
		if(mailbox !== 'sent'){
			const btn_reply = document.createElement('button');
			btn_reply.innerHTML = 'Reply';
			btn_reply.className = 'btn btn-info';
			btn_reply.addEventListener('click', function(){
				compose_email();
				
				document.querySelector('#compose-recipients').value = email.sender;
				let subject = email.subject;
				if(subject.split('',1)[0] != 'Re:'){
					subject = "Re:" + email.subject;
				}
				document.querySelector('#compose-subject').value = subject;
				document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
			})
			document.querySelector('#email-detail-view').append(btn_reply);	
		};
	});
}


function load_mailbox(mailbox) {
  // check maibox == "sent"
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
	.then(response => response.json())
	.then(emails => {
		// Print emails
		console.log(emails);

		// ... do something else with emails ...
		for(i=0;i<emails.length;i++){
			email = emails[i];
			// create div for email
			const newEmail = document.createElement('div');
			newEmail.innerHTML = `
				<h6>Sender: ${email.sender}</h6>
				<h5>Subject: ${email.subject}</h5>
				<p>${email.timestamp}</p>`;
			// change to read
			newEmail.className = email.read ? 'read':'unread';
			newEmail.addEventListener('click',function(){
				view_email(email.id,mailbox);
			})
			document.querySelector('#emails-view').append(newEmail);
		}	
	});	
	
}


function send_email(event){
	event.preventDefault();
	
	// store fields
	const recipients = document.querySelector('#compose-recipients').value;
	const subject = document.querySelector('#compose-subject').value;
	const body = document.querySelector('#compose-body').value;
	
	fetch('/emails', {
	  method: 'POST',
	  body: JSON.stringify({
		  recipients: recipients,
		  subject: subject,
		  body: body
	  })
	})
	.then(response => response.json())
	.then(email => {
		// Print result
		console.log(email);
		load_mailbox('sent');
	});			
};


