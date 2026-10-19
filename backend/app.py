from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

# Resolve absolute paths relative to this file so the DB lives in instance/
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DB = os.path.normpath(os.path.join(BASE_DIR, '..', 'instance', 'hospital.db'))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hospital-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + INSTANCE_DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# ==================== MODELS ====================

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, doctor, patient
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    specialization = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    room_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.String(20))
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    blood_group = db.Column(db.String(5))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    appointment_date = db.Column(db.String(20), nullable=False)
    appointment_time = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, cancelled, completed
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'))
    diagnosis = db.Column(db.Text)
    medication = db.Column(db.Text)
    dosage = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, paid
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

# ==================== SEED DATA ====================

def seed_database():
    """Create sample data if database is empty"""
    with app.app_context():
        db.create_all()
        
        if User.query.filter_by(username='admin').first():
            repair_user_profiles()
            return  # Already seeded

        # Check if already seeded (by email, which is the stable identifier)
        if User.query.filter_by(email='admin@hospital.com').first():
            repair_user_profiles()
            return  # Already seeded

        # Admin
        admin = User(username='admin', email='admin@hospital.com', role='admin', first_name='System', last_name='Admin')
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Doctors
        doctors_data = [
            ('Dr. Sarah', 'Chen', 'Cardiology', '555-0101', 'Room 201'),
            ('Dr. Michael', 'Patel', 'Neurology', '555-0102', 'Room 202'),
            ('Dr. Emily', 'Rodriguez', 'Pediatrics', '555-0103', 'Room 203'),
            ('Dr. James', 'Wilson', 'Orthopedics', '555-0104', 'Room 204'),
            ('Dr. Aisha', 'Khan', 'Dermatology', '555-0105', 'Room 205'),
        ]
        
        for first, last, spec, phone, room in doctors_data:
            doctor_first_name = first.replace('Dr. ', '')
            doctor_last_name = last.replace('Dr. ', '')
            user = User(username=f"dr_{doctor_first_name.lower()}_{doctor_last_name.lower()}", email=f'{first.lower().replace(" ","")}@hospital.com', 
                       role='doctor', first_name=doctor_first_name, last_name=doctor_last_name, phone=phone)
            user.set_password('doctor123')
            db.session.add(user)
            db.session.flush()
            doctor = Doctor(first_name=doctor_first_name, last_name=doctor_last_name,
                           specialization=spec, phone=phone, room_number=room, user_id=user.id)
            db.session.add(doctor)
        
        # Patients
        patients_data = [
            ('Raj', 'Mehta', '1985-03-15', 'Male', '9876543210', '123 Main St, Mumbai', 'A+'),
            ('Priya', 'Sharma', '1990-07-22', 'Female', '9876543211', '456 Park Ave, Delhi', 'B+'),
            ('Akash', 'Singh', '1995-11-08', 'Male', '9876543212', '789 Lake Rd, Bangalore', 'O+'),
            ('Meera', 'Iyer', '1988-04-30', 'Female', '9876543213', '321 Hill St, Chennai', 'AB+'),
            ('Vikram', 'Joshi', '1978-09-12', 'Male', '9876543214', '555 River Rd, Kolkata', 'A-'),
        ]
        
        for first, last, dob, gender, phone, address, blood in patients_data:
            user = User(username=f'patient_{first.lower()}_{last.lower()}', email=f'{first.lower()}.{last.lower()}@email.com',
                       role='patient', first_name=first, last_name=last, phone=phone)
            user.set_password('patient123')
            db.session.add(user)
            db.session.flush()
            patient = Patient(first_name=first, last_name=last, date_of_birth=dob, gender=gender,
                             phone=phone, address=address, blood_group=blood, user_id=user.id)
            db.session.add(patient)
        
        # Sample appointments
        today = datetime.now()
        appointments_data = [
            (0, 0, today.strftime('%Y-%m-%d'), '09:00 AM', 'scheduled', 'Chest pain evaluation'),
            (1, 1, today.strftime('%Y-%m-%d'), '10:30 AM', 'confirmed', 'Follow-up consultation'),
            (2, 2, (today + timedelta(days=1)).strftime('%Y-%m-%d'), '11:00 AM', 'scheduled', 'Routine checkup'),
            (3, 3, (today + timedelta(days=2)).strftime('%Y-%m-%d'), '09:30 AM', 'scheduled', 'Knee pain assessment'),
            (4, 4, (today + timedelta(days=1)).strftime('%Y-%m-%d'), '02:00 PM', 'scheduled', 'Skin rash consultation'),
        ]
        
        for p_idx, d_idx, date, time, status, notes in appointments_data:
            patient = Patient.query.offset(p_idx).first()
            doctor = Doctor.query.offset(d_idx).first()
            if patient and doctor:
                appt = Appointment(patient_id=patient.id, doctor_id=doctor.id,
                                 appointment_date=date, appointment_time=time,
                                 status=status, notes=notes)
                db.session.add(appt)
        
        # Sample bills
        bills_data = [
            (0, 2500.00, 'Cardiology consultation + ECG', 'pending'),
            (1, 1500.00, 'Neurology follow-up consultation', 'pending'),
            (3, 5000.00, 'MRI scan - Knee', 'pending'),
        ]
        
        for p_idx, amount, desc, status in bills_data:
            patient = Patient.query.offset(p_idx).first()
            if patient:
                bill = Bill(patient_id=patient.id, amount=amount, description=desc, status=status)
                db.session.add(bill)
        
        db.session.commit()
        print("Database seeded successfully!")

def repair_user_profiles():
    """Reconnect profiles created by earlier seeds and fill missing role profiles."""
    for user in User.query.filter_by(role='doctor').all():
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            doctor = Doctor.query.filter_by(
                user_id=None,
                first_name=user.first_name,
                last_name=user.last_name
            ).first()
            if doctor:
                doctor.user_id = user.id
            else:
                db.session.add(Doctor(
                    user_id=user.id,
                    first_name=user.first_name or '',
                    last_name=user.last_name or ''
                ))

        legacy_username = f"dr_dr._{(user.first_name or '').lower()}"
        corrected_username = f"dr_{(user.first_name or '').lower()}_{(user.last_name or '').lower()}"
        if user.username == legacy_username and not User.query.filter_by(username=corrected_username).first():
            user.username = corrected_username

    for user in User.query.filter_by(role='patient').all():
        patient = Patient.query.filter_by(user_id=user.id).first()
        if not patient:
            patient = Patient.query.filter_by(
                user_id=None,
                first_name=user.first_name,
                last_name=user.last_name
            ).first()
            if patient:
                patient.user_id = user.id
            else:
                db.session.add(Patient(
                    user_id=user.id,
                    first_name=user.first_name or '',
                    last_name=user.last_name or ''
                ))

    db.session.commit()

# ==================== ROUTES ====================

@app.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin_dashboard'))
        elif current_user.role == 'doctor':
            return redirect(url_for('doctor_dashboard'))
        elif current_user.role == 'patient':
            return redirect(url_for('patient_dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            if user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
            elif user.role == 'doctor':
                return redirect(url_for('doctor_dashboard'))
            elif user.role == 'patient':
                return redirect(url_for('patient_dashboard'))
        else:
            error = 'Invalid username or password'
    
    return render_template('login.html', error=error)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '')
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        role = request.form.get('role', 'patient')
        first_name = request.form.get('first_name', '')
        last_name = request.form.get('last_name', '')
        
        if User.query.filter_by(username=username).first():
            error = 'Username already exists'
        else:
            user = User(username=username, email=email, role=role, first_name=first_name, last_name=last_name)
            user.set_password(password)
            db.session.add(user)
            if role == 'patient':
                db.session.flush()
                db.session.add(Patient(user_id=user.id, first_name=first_name, last_name=last_name))
            elif role == 'doctor':
                db.session.flush()
                db.session.add(Doctor(user_id=user.id, first_name=first_name, last_name=last_name))
            db.session.commit()
            return redirect(url_for('login'))
    
    return render_template('register.html', error=error)

# ==================== ADMIN ROUTES ====================

@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()
    pending_appointments = Appointment.query.filter_by(status='scheduled').count()
    total_bills = Bill.query.count()
    pending_bills = Bill.query.filter_by(status='pending').count()
    
    recent_appointments = Appointment.query.order_by(Appointment.created_at.desc()).limit(10).all()
    doctors = Doctor.query.all()
    patients = Patient.query.order_by(Patient.created_at.desc()).limit(10).all()
    
    return render_template('admin/dashboard.html',
                         total_patients=total_patients,
                         total_doctors=total_doctors,
                         total_appointments=total_appointments,
                         pending_appointments=pending_appointments,
                         total_bills=total_bills,
                         pending_bills=pending_bills,
                         recent_appointments=recent_appointments,
                         doctors=doctors,
                         patients=patients)

@app.route('/admin/doctors')
@login_required
def admin_doctors():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    doctors = Doctor.query.all()
    return render_template('admin/doctors.html', doctors=doctors)

@app.route('/admin/patients/add', methods=['GET', 'POST'])
def admin_add_patient():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    error = None
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        date_of_birth = request.form.get('date_of_birth', '').strip()
        gender = request.form.get('gender', '').strip()
        phone = request.form.get('phone', '').strip()
        address = request.form.get('address', '').strip()
        blood_group = request.form.get('blood_group', '').strip()
        username = request.form.get('username', '').strip().lower()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()

        if not first_name or not last_name or not username or not password:
            error = 'First name, last name, username, and password are required.'
        elif User.query.filter_by(username=username).first():
            error = 'Username already exists.'
        elif User.query.filter_by(email=email).first():
            error = 'Email already registered.'
        else:
            user = User(username=username, email=email, role='patient',
                        first_name=first_name, last_name=last_name)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
            patient = Patient(user_id=user.id, first_name=first_name, last_name=last_name,
                              date_of_birth=date_of_birth, gender=gender, phone=phone,
                              address=address, blood_group=blood_group)
            db.session.add(patient)
            db.session.commit()
            flash('Patient added successfully.', 'success')
            return redirect(url_for('admin_patients'))

    return render_template('admin/add_patient.html', error=error)

@app.route('/admin/patients')
@login_required
def admin_patients():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    return render_template('admin/patients.html', patients=patients)

@app.route('/admin/appointments')
@login_required
def admin_appointments():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    appointments = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return render_template('admin/appointments.html', appointments=appointments)

# ==================== DOCTOR ROUTES ====================

@app.route('/doctor')
@login_required
def doctor_dashboard():
    if current_user.role != 'doctor':
        return redirect(url_for('index'))
    
    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    if not doctor:
        return redirect(url_for('index'))
    
    appointments = Appointment.query.filter_by(doctor_id=doctor.id).order_by(Appointment.appointment_date.desc()).all()
    prescriptions = Prescription.query.filter_by(doctor_id=doctor.id).order_by(Prescription.created_at.desc()).limit(10).all()
    
    return render_template('doctor/dashboard.html', doctor=doctor, appointments=appointments, prescriptions=prescriptions)

@app.route('/doctor/appointments')
@login_required
def doctor_appointments():
    if current_user.role != 'doctor':
        return redirect(url_for('index'))
    
    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    appointments = Appointment.query.filter_by(doctor_id=doctor.id).order_by(Appointment.appointment_date.desc()).all()
    return render_template('doctor/appointments.html', appointments=appointments)

@app.route('/doctor/create-prescription/<int:appointment_id>', methods=['POST'])
@login_required
def create_prescription(appointment_id):
    if current_user.role != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor = Doctor.query.filter_by(user_id=current_user.id).first()
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment or appointment.doctor_id != doctor.id:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.json
    prescription = Prescription(
        patient_id=appointment.patient_id,
        doctor_id=doctor.id,
        appointment_id=appointment.id,
        diagnosis=data.get('diagnosis', ''),
        medication=data.get('medication', ''),
        dosage=data.get('dosage', ''),
        notes=data.get('notes', '')
    )
    db.session.add(prescription)
    
    appointment.status = 'completed'
    db.session.commit()
    
    return jsonify({'success': True, 'prescription_id': prescription.id})

# ==================== PATIENT ROUTES ====================

@app.route('/patient')
@login_required
def patient_dashboard():
    if current_user.role != 'patient':
        return redirect(url_for('index'))
    
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        patient = Patient(
            user_id=current_user.id,
            first_name=current_user.first_name or '',
            last_name=current_user.last_name or ''
        )
        db.session.add(patient)
        db.session.commit()
    
    appointments = Appointment.query.filter_by(patient_id=patient.id).order_by(Appointment.appointment_date.asc()).all()
    prescriptions = Prescription.query.filter_by(patient_id=patient.id).order_by(Prescription.created_at.desc()).all()
    bills = Bill.query.filter_by(patient_id=patient.id).order_by(Bill.created_at.desc()).all()
    doctors = Doctor.query.all()
    
    return render_template('patient/dashboard.html', patient=patient,
                         appointments=appointments, prescriptions=prescriptions,
                         bills=bills, doctors=doctors)

@app.route('/patient/book-appointment', methods=['POST'])
@login_required
def book_appointment():
    if current_user.role != 'patient':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    data = request.json
    doctor_id = data.get('doctor_id')
    appointment_date = data.get('date')
    appointment_time = data.get('time')
    notes = data.get('notes', '')
    
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status='scheduled',
        notes=notes
    )
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({'success': True, 'appointment_id': appointment.id})


# ── Patient sub-pages ───────────────────────────────────────────────
@app.route('/patient/appointments')
@login_required
def patient_appointments():
    if current_user.role != 'patient':
        return redirect(url_for('index'))
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return redirect(url_for('index'))
    appointments = Appointment.query.filter_by(patient_id=patient.id).order_by(Appointment.appointment_date.asc()).all()
    return render_template('patient/appointments.html', appointments=appointments)


@app.route('/patient/prescriptions')
@login_required
def patient_prescriptions():
    if current_user.role != 'patient':
        return redirect(url_for('index'))
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return redirect(url_for('index'))
    prescriptions = Prescription.query.filter_by(patient_id=patient.id).order_by(Prescription.created_at.desc()).all()
    return render_template('patient/prescriptions.html', prescriptions=prescriptions)


@app.route('/patient/bills')
@login_required
def patient_bills():
    if current_user.role != 'patient':
        return redirect(url_for('index'))
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return redirect(url_for('index'))
    bills = Bill.query.filter_by(patient_id=patient.id).order_by(Bill.created_at.desc()).all()
    return render_template('patient/bills.html', bills=bills)


# ── Aggregated stats API ────────────────────────────────────────────
@app.route('/api/stats')
@login_required
def api_stats():
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()
    pending_appointments = Appointment.query.filter_by(status='scheduled').count()
    total_bills = Bill.query.count()
    pending_bills = Bill.query.filter_by(status='pending').count()

    recent_appointments = Appointment.query.order_by(Appointment.appointment_date.desc()).limit(10).all()
    doctors = Doctor.query.all()
    patients = Patient.query.order_by(Patient.created_at.desc()).limit(10).all()

    return jsonify({
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'pending_appointments': pending_appointments,
        'total_bills': total_bills,
        'pending_bills': pending_bills,
        'recent_appointments': [{
            'id': a.id,
            'patient_id': a.patient_id,
            'doctor_id': a.doctor_id,
            'date': a.appointment_date,
            'time': a.appointment_time,
            'status': a.status,
            'notes': a.notes,
        } for a in recent_appointments],
        'doctors': [{
            'id': d.id,
            'first_name': d.first_name,
            'last_name': d.last_name,
            'specialization': d.specialization,
            'phone': d.phone,
            'room_number': d.room_number,
        } for d in doctors],
        'patients': [{
            'id': p.id,
            'first_name': p.first_name,
            'last_name': p.last_name,
            'phone': p.phone,
            'blood_group': p.blood_group,
            'created_at': (p.created_at.strftime('%Y-%m-%d') if p.created_at else None),
        } for p in patients],
    })


# ── Current user API ─────────────────────────────────────────────────
@app.route('/api/me')
@login_required
def api_me():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'role': current_user.role,
        'first_name': current_user.first_name,
        'last_name': current_user.last_name,
        'phone': current_user.phone,
    })


# ── Resource list APIs ──────────────────────────────────────────────
@app.route('/api/patients')
@login_required
def api_patients():
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    return jsonify([{
        'id': p.id,
        'first_name': p.first_name,
        'last_name': p.last_name,
        'date_of_birth': p.date_of_birth,
        'gender': p.gender,
        'phone': p.phone,
        'address': p.address,
        'blood_group': p.blood_group,
        'created_at': (p.created_at.strftime('%Y-%m-%d') if p.created_at else None),
    } for p in patients])


@app.route('/api/appointments')
@login_required
def api_appointments():
    appointments = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'date': a.appointment_date,
        'time': a.appointment_time,
        'patient_id': a.patient_id,
        'doctor_id': a.doctor_id,
        'notes': a.notes,
        'status': a.status,
    } for a in appointments])

@app.route('/patient/bill/<int:bill_id>/pay', methods=['POST'])
@login_required
def pay_bill(bill_id):
    if current_user.role != 'patient':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    bill = Bill.query.get(bill_id)
    
    if bill and bill.patient_id == patient.id:
        bill.status = 'paid'
        bill.paid_at = datetime.now()
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({'error': 'Bill not found'}), 404

# ==================== API ENDPOINTS ====================

@app.route('/api/doctors')
def api_doctors():
    doctors = Doctor.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.full_name(),
        'specialization': d.specialization,
        'phone': d.phone,
        'room': d.room_number
    } for d in doctors])

@app.route('/api/patients/<int:patient_id>')
def api_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        'id': patient.id,
        'name': patient.full_name(),
        'dob': patient.date_of_birth,
        'gender': patient.gender,
        'phone': patient.phone,
        'address': patient.address,
        'blood_group': patient.blood_group
    })

# Serve the React SPA build from the dist directory
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist')
if os.path.isdir(FRONTEND_DIST):
    from flask import send_from_directory

    @app.route('/<path:subpath>')
    def spa_proxy(subpath):
        if subpath.startswith('api/'):
            return None
        asset = os.path.join(FRONTEND_DIST, subpath)
        if os.path.isfile(asset):
            return send_from_directory(os.path.dirname(asset), os.path.basename(asset))
        return send_from_directory(FRONTEND_DIST, 'index.html')


if __name__ == '__main__':
    seed_database()
    port = int(os.environ.get('PORT', 5050))
    app.run(debug=False, host='127.0.0.1', port=port)
